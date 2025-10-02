import React from 'react';

const SkeletonLine: React.FC<{ width: string; height?: string }> = ({ width, height = 'h-4' }) => (
  <div className={`bg-gray-700/50 rounded ${height} ${width}`}></div>
);

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-700/50 rounded ${className}`}></div>
);

export const StrategistSkeleton: React.FC = () => (
    <div className="space-y-5 animate-pulse">
        <div className="space-y-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine width="w-3/4" />
        </div>
        <div className="space-y-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine width="w-1/2" />
        </div>
        <div className="space-y-2">
            <SkeletonLine width="w-1/3" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-5/6" />
        </div>
         <div className="space-y-2">
            <SkeletonLine width="w-1/3" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-4/6" />
        </div>
    </div>
);

export const CopywriterSkeleton: React.FC = () => (
    <div className="space-y-5 animate-pulse">
        <div className="space-y-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine width="w-1/3" height="h-5" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-5/6" />
        </div>
        <div className="space-y-2">
            <SkeletonLine width="w-1/3" />
            <div className="pl-6 space-y-2">
                <SkeletonLine width="w-full" />
                <SkeletonLine width="w-5/6" />
                <SkeletonLine width="w-full" />
            </div>
        </div>
        <div className="space-y-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine width="w-1/3" height="h-5" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-4/6" />
        </div>
    </div>
);

export const VisualArtistSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div>
            <SkeletonLine width="w-1/3" />
            <div className="flex flex-wrap gap-4 mt-2">
                <SkeletonBlock className="w-16 h-16 rounded-lg" />
                <SkeletonBlock className="w-16 h-16 rounded-lg" />
                <SkeletonBlock className="w-16 h-16 rounded-lg" />
                <SkeletonBlock className="w-16 h-16 rounded-lg" />
                <SkeletonBlock className="w-16 h-16 rounded-lg" />
            </div>
        </div>
        <div>
            <SkeletonLine width="w-1/4" />
            <SkeletonBlock className="w-32 h-32 rounded-lg mt-2" />
        </div>
        <div>
            <SkeletonLine width="w-1/2" />
            <div className="flex gap-4 mt-2">
                <SkeletonBlock className="w-1/2 aspect-square rounded-lg" />
                <SkeletonBlock className="w-1/2 aspect-square rounded-lg" />
            </div>
        </div>
    </div>
);

export const VideoEditorSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <SkeletonBlock className="w-full aspect-video rounded-lg" />
    </div>
);
