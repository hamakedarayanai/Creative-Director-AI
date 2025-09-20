
import React, { useState, useCallback } from 'react';
import type { AgentName, AgentStatus, CampaignData, StrategyOutput, CopyOutput, VisualsOutput, VideoOutput } from './types';
import AgentCard from './components/AgentCard';
import ColorPalette from './components/ColorPalette';
import * as geminiService from './services/geminiService';
import { StrategistIcon, CopywriterIcon, VisualArtistIcon, VideoEditorIcon } from './components/icons';

const initialStatuses: Record<AgentName, AgentStatus> = {
  Strategist: 'pending',
  Copywriter: 'pending',
  'Visual Artist': 'pending',
  'Video Editor': 'pending',
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("Create a marketing campaign for a new coffee brand called 'Morning Glory'.");
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const workingAgent = Object.entries(agentStatuses).find(([, status]) => status === 'working')?.[0] as AgentName;
      if (workingAgent) {
        setAgentStatus(workingAgent, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, agentStatuses]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Creative Director AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">Your automated creative team, powered by Gemini.</p>
        </header>

        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-gray-700 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A new sustainable sneaker brand for urban explorers"
              className="w-full flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleStartCampaign}
              disabled={isLoading}
              className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Generating...' : 'Start Campaign'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AgentCard title="Strategist" icon={<StrategistIcon className="w-8 h-8 text-purple-400" />} status={agentStatuses.Strategist}>
            {campaignData?.strategy ? (
                <div className="space-y-4 text-sm text-gray-300">
                    <div><strong className="text-gray-100">Brand Name:</strong> {campaignData.strategy.brandName}</div>
                    <div><strong className="text-gray-100">Tagline:</strong> {campaignData.strategy.tagline}</div>
                    <div><strong className="text-gray-100 block mb-1">Market Research:</strong> <p className="whitespace-pre-wrap font-light">{campaignData.strategy.marketResearch}</p></div>
                    <div><strong className="text-gray-100 block mb-1">Brand Identity:</strong> <p className="whitespace-pre-wrap font-light">{campaignData.strategy.brandIdentity}</p></div>
                    <div><strong className="text-gray-100 block mb-1">Creative Brief:</strong> <p className="whitespace-pre-wrap font-light">{campaignData.strategy.creativeBrief}</p></div>
                </div>
            ) : <p className="text-gray-500">Waiting for campaign to start...</p>}
          </AgentCard>

          <AgentCard title="Copywriter" icon={<CopywriterIcon className="w-8 h-8 text-green-400" />} status={agentStatuses.Copywriter}>
            {campaignData?.copy ? (
                 <div className="space-y-4 text-sm text-gray-300">
                     {campaignData.copy.adCopy.map((ad, i) => (
                         <div key={i}><strong className="text-gray-100 block mb-1">Ad Copy {i+1}:</strong> <p className="pl-2 border-l-2 border-gray-600 font-light"><strong>{ad.title}</strong><br/>{ad.body}</p></div>
                     ))}
                     <div><strong className="text-gray-100 block mb-1">Social Media Captions:</strong>
                        <ul className="list-disc pl-6 space-y-1 font-light">{campaignData.copy.socialMediaCaptions.map((cap, i) => <li key={i}>{cap}</li>)}</ul>
                     </div>
                     <div><strong className="text-gray-100 block mb-1">Blog Post:</strong> <p className="pl-2 border-l-2 border-gray-600 font-light"><strong>{campaignData.copy.blogPost.title}</strong><br/>{campaignData.copy.blogPost.content}</p></div>
                 </div>
            ) : <p className="text-gray-500">Waiting for strategist...</p>}
          </AgentCard>

          <AgentCard title="Visual Artist" icon={<VisualArtistIcon className="w-8 h-8 text-yellow-400" />} status={agentStatuses['Visual Artist']}>
             {campaignData?.visuals ? (
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
             ) : <p className="text-gray-500">Waiting for copywriter...</p>}
          </AgentCard>

          <AgentCard title="Video Editor" icon={<VideoEditorIcon className="w-8 h-8 text-red-400" />} status={agentStatuses['Video Editor']} statusMessage={agentStatuses['Video Editor'] === 'working' ? videoStatusMessage : agentStatuses['Video Editor']}>
             {campaignData?.video ? (
                <video src={campaignData.video.videoUrl} controls className="w-full rounded-lg" />
             ) : <p className="text-gray-500">Waiting for visual artist...</p>}
          </AgentCard>
        </div>
      </div>
    </div>
  );
};

export default App;
