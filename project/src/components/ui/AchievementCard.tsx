import React from 'react';
import { 
  Award, CalendarIcon, Edit, MessageSquare, Play, FileTextIcon
} from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  showProgress = true 
}) => {
  const getIcon = () => {
    const iconProps = { className: "h-6 w-6" };
    switch (achievement.icon) {
      case 'award':
        return <Award {...iconProps} />;
      case 'trophy':
        return <Award {...iconProps} />;  // Fallback to Award
      case 'calendar':
        return <CalendarIcon {...iconProps} />;
      case 'edit':
        return <Edit {...iconProps} />;
      case 'message-circle':
        return <MessageSquare {...iconProps} />;
      case 'play-circle':
        return <Play {...iconProps} />;
      case 'file-text':
        return <FileTextIcon {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const isUnlocked = achievement.progress === 100 || !!achievement.unlockedAt;
  const progressValue = achievement.progress || 0;

  return (
    <div className={`flex flex-col p-4 rounded-lg border ${
      isUnlocked 
        ? 'bg-surface-light border-primary/30' 
        : 'bg-surface-dark border-gray-700/30'
    }`}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`p-2 rounded-full ${
          isUnlocked 
            ? 'bg-primary/20 text-primary' 
            : 'bg-gray-700/20 text-gray-400'
        }`}>
          {getIcon()}
        </div>
        <div>
          <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
            {achievement.name}
          </h3>
          <p className="text-sm text-gray-400">
            {achievement.description}
          </p>
        </div>
      </div>
      
      {showProgress && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">İlerleme</span>
            <span className={isUnlocked ? 'text-primary' : 'text-gray-400'}>
              {progressValue}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isUnlocked ? 'bg-primary' : 'bg-gray-500'}`} 
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {isUnlocked && achievement.unlockedAt && (
        <div className="mt-2 text-xs text-gray-400">
          {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')} tarihinde kazanıldı
        </div>
      )}
    </div>
  );
};

export default AchievementCard; 