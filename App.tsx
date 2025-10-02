
import React, { useState, useCallback } from 'react';
import type { AgentName, AgentStatus, CampaignData, StrategyOutput, CopyOutput, VisualsOutput, VideoOutput } from './types';
import AgentCard from './components/AgentCard';
import ColorPalette from './components/ColorPalette';
import * as geminiService from './services/geminiService';
import { StrategistIcon, CopywriterIcon, VisualArtistIcon, VideoEditorIcon, SparklesIcon } from './components/icons';
import { StrategistSkeleton, CopywriterSkeleton, VisualArtistSkeleton, VideoEditorSkeleton } from './components/Skeletons';

const initialStatuses: Record<AgentName, AgentStatus> = {
  Strategist: 'pending',
  Copywriter: 'pending',
  'Visual Artist': 'pending',
  'Video Editor': 'pending',
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("A marketing campaign for a new eco-friendly subscription box for pets.");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [campaignStarted, setCampaignStarted] = useState<boolean>(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentName, AgentStatus>>(initialStatuses);
  const [videoStatusMessage, setVideoStatusMessage] = useState<string>('pending');
  const [error, setError] = useState<string | null>(null);

  const setAgentStatus = (name: AgentName, status: AgentStatus) => {
    setAgentStatuses(prev => ({ ...prev, [name]: status }));
  };

  const handleStartCampaign = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a campaign idea.");
      return;
    }
    setIsLoading(true);
    setCampaignStarted(true);
    setError(null);
    setCampaignData(null);
    setAgentStatuses(initialStatuses);
    setVideoStatusMessage('pending');

    try {
      // Strategist
      setAgentStatus('Strategist', 'working');
      const strategy: StrategyOutput = await geminiService.generateStrategy(prompt);
      setCampaignData(prev => ({ ...prev, strategy }));
      setAgentStatus('Strategist', 'completed');

      // Copywriter
      setAgentStatus('Copywriter', 'working');
      const copy: CopyOutput = await geminiService.generateCopy(strategy.creativeBrief);
      setCampaignData(prev => ({ ...prev, copy }));
      setAgentStatus('Copywriter', 'completed');

      // Visual Artist
      setAgentStatus('Visual Artist', 'working');
      const adCopyForVisuals = copy.adCopy[0].title + " " + copy.adCopy[0].body;
      const visuals: VisualsOutput = await geminiService.generateVisuals(strategy.brandName, strategy.creativeBrief, adCopyForVisuals);
      setCampaignData(prev => ({ ...prev, visuals }));
      setAgentStatus('Visual Artist', 'completed');
      
      // Video Editor
      setAgentStatus('Video Editor', 'working');
      const videoPrompt = `An ad for ${strategy.brandName}. ${copy.adCopy[1].title}: ${copy.adCopy[1].body}`;
      const video: VideoOutput = await geminiService.generateVideo(
          videoPrompt,
          visuals.marketingImages[0],
          (message: string) => {
              setVideoStatusMessage(message);
          }
      );
      setCampaignData(prev => ({ ...prev, video }));
      setAgentStatus('Video Editor', 'completed');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Campaign failed: ${errorMessage}`);
      // Use a functional update to get the latest state
      setAgentStatuses(prevStatuses => {
        const workingAgent = Object.entries(prevStatuses).find(([, status]) => status === 'working')?.[0] as AgentName;
        if (workingAgent) {
          return { ...prevStatuses, [workingAgent]: 'error' };
        }
        return prevStatuses;
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const renderStrategistContent = () => {
    if (agentStatuses.Strategist === 'working') return <StrategistSkeleton />;
    if (campaignData?.strategy) {
      return (
          <div className="space-y-4 text-sm text-gray-300">
              <div><strong className="text-gray-100">Brand Name:</strong> {campaignData.strategy.brandName}</div>
              <div><strong className="text-gray-100">Tagline:</strong> {campaignData.strategy.tagline}</div>
              <div><strong className="text-gray-100 block mb-1">Market Research:</strong> <p className="whitespace-pre-wrap font-light">{campaignData.strategy.marketResearch}</p></div>
              <div><strong className="text-gray-100 block mb-1">Brand Identity:</strong> <p className="whitespace-pre-wrap font-light">{campaignData.strategy.brandIdentity}</p></div>
              <div><strong className="text-gray-100 block mb-1">Creative Brief:</strong> <p className="whitespace-pre-wrap font-light">{campaignData.strategy.creativeBrief}</p></div>
          </div>
      );
    }
    return <p className="text-gray-500">{campaignStarted ? 'Starting creative engine...' : 'Waiting for campaign to start...'}</p>;
  };

  const renderCopywriterContent = () => {
    if (agentStatuses.Copywriter === 'working') return <CopywriterSkeleton />;
    if (campaignData?.copy) {
      return (
            <div className="space-y-4 text-sm text-gray-300">
                {campaignData.copy.adCopy.map((ad, i) => (
                    <div key={i}><strong className="text-gray-100 block mb-1">Ad Copy {i+1}:</strong> <p className="pl-2 border-l-2 border-gray-600 font-light"><strong>{ad.title}</strong><br/>{ad.body}</p></div>
                ))}
                <div><strong className="text-gray-100 block mb-1">Social Media Captions:</strong>
                  <ul className="list-disc pl-6 space-y-1 font-light">{campaignData.copy.socialMediaCaptions.map((cap, i) => <li key={i}>{cap}</li>)}</ul>
                </div>
                <div><strong className="text-gray-100 block mb-1">Blog Post:</strong> <p className="pl-2 border-l-2 border-gray-600 font-light"><strong>{campaignData.copy.blogPost.title}</strong><br/>{campaignData.copy.blogPost.content}</p></div>
            </div>
      );
    }
    return <p className="text-gray-500">Waiting for strategist...</p>;
  }

  const renderVisualArtistContent = () => {
    if (agentStatuses['Visual Artist'] === 'working') return <VisualArtistSkeleton />;
    if (campaignData?.visuals) {
      return (
          <div className="space-y-6">
              <div>
                  <h4 className="font-semibold text-gray-200 mb-2">Color Palette</h4>
                  <ColorPalette colors={campaignData.visuals.colorPalette} />
              </div>
              <div>
                  <h4 className="font-semibold text-gray-200 mb-2">Logo</h4>
                  <img src={`data:image/jpeg;base64,${campaignData.visuals.logo}`} alt="Generated Logo" className="rounded-lg bg-white p-2 w-32 h-32 object-contain" />
              </div>
              <div>
                  <h4 className="font-semibold text-gray-200 mb-2">Marketing Images</h4>
                  <div className="flex gap-4">
                      {campaignData.visuals.marketingImages.map((img, i) => (
                          <img key={i} src={`data:image/jpeg;base64,${img}`} alt={`Marketing Image ${i+1}`} className="rounded-lg w-1/2 object-cover aspect-square" />
                      ))}
                  </div>
              </div>
          </div>
      );
    }
    return <p className="text-gray-500">Waiting for copywriter...</p>;
  }

  const renderVideoEditorContent = () => {
    if (agentStatuses['Video Editor'] === 'working') return <VideoEditorSkeleton />;
    if (campaignData?.video) {
        return <video src={campaignData.video.videoUrl} controls className="w-full rounded-lg" />;
    }
    return <p className="text-gray-500">Waiting for visual artist...</p>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 animate-text-glow">
            Creative Director AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">Your automated creative team, powered by Gemini.</p>
        </header>

        <div className="mb-10">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A new sustainable sneaker brand for urban explorers"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 pr-40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 resize-none text-base"
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading) handleStartCampaign();
                }
              }}
            />
            <button
              onClick={handleStartCampaign}
              disabled={isLoading}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <SparklesIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
              {isLoading ? 'Generating...' : 'Start Campaign'}
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentCard title="Strategist" icon={<StrategistIcon className="w-8 h-8 text-purple-400" />} status={agentStatuses.Strategist}>
            {renderStrategistContent()}
          </AgentCard>

          <AgentCard title="Copywriter" icon={<CopywriterIcon className="w-8 h-8 text-green-400" />} status={agentStatuses.Copywriter}>
            {renderCopywriterContent()}
          </AgentCard>

          <AgentCard title="Visual Artist" icon={<VisualArtistIcon className="w-8 h-8 text-yellow-400" />} status={agentStatuses['Visual Artist']}>
            {renderVisualArtistContent()}
          </AgentCard>

          <AgentCard title="Video Editor" icon={<VideoEditorIcon className="w-8 h-8 text-red-400" />} status={agentStatuses['Video Editor']} statusMessage={agentStatuses['Video Editor'] === 'working' ? videoStatusMessage : agentStatuses['Video Editor']}>
            {renderVideoEditorContent()}
          </AgentCard>
        </div>
      </div>
    </div>
  );
};

export default App;
