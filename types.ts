
export type AgentName = 'Strategist' | 'Copywriter' | 'Visual Artist' | 'Video Editor';
export type AgentStatus = 'pending' | 'working' | 'completed' | 'error';

export interface StrategyOutput {
  brandName: string;
  tagline: string;
  marketResearch: string;
  brandIdentity: string;
  creativeBrief: string;
}

export interface CopyOutput {
  adCopy: { title: string; body: string }[];
  socialMediaCaptions: string[];
  blogPost: { title: string; content: string };
}

export interface VisualsOutput {
  colorPalette: string[];
  logo: string; // base64
  marketingImages: string[]; // base64
}

export interface VideoOutput {
  videoUrl: string; // object URL
}

export interface CampaignData {
  strategy?: StrategyOutput;
  copy?: CopyOutput;
  visuals?: VisualsOutput;
  video?: VideoOutput;
}
