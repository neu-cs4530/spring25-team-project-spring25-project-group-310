import { Flex, Text } from 'theme-ui';
import useUserContext from '../../hooks/useUserContext';
import useThemeVote from '../../hooks/useThemeVote';

// Custom SVG Chevron Up Icon
const ChevronUpIcon = ({
  size = 20,
  color = 'gray',
  strokeWidth = 1.5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'>
    <polyline points='18 15 12 9 6 15'></polyline>
  </svg>
);

const ChevronDownIcon = ({
  size = 20,
  color = 'gray',
  strokeWidth = 1.5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'>
    <polyline points='6 9 12 15 18 9'></polyline>
  </svg>
);

// Function to determine text color based on count
const getCountColor = (count: number) => {
  if (count > 0) return 'green';
  if (count < 0) return 'red';
  return 'inherit';
};

// Voting Component
const ThemeVoteComponent = ({
  themeName,
  themeVotes,
  onVoteUpdate,
}: {
  themeName: string;
  themeVotes: Record<string, { upVotes: string[]; downVotes: string[] }>;
  onVoteUpdate: () => void;
}) => {
  const { user, socket } = useUserContext();
  const { count, voted } = useThemeVote(themeVotes, themeName);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user || !socket) return;

    // Emit socket event for real-time update
    socket.emit('themeVote', {
      theme: themeName,
      voteType,
      username: user.username,
    });

    setTimeout(() => {
      onVoteUpdate();
    }, 500);
  };

  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}>
      <Flex
        sx={{
          alignItems: 'center',
          cursor: user ? 'pointer' : 'not-allowed',
          opacity: user ? 1 : 0.5,
        }}
        onClick={() => user && handleVote('up')}>
        <ChevronUpIcon
          size={20}
          color={voted === 1 ? 'green' : 'gray'}
          strokeWidth={voted === 1 ? 2.5 : 1.5}
        />
      </Flex>

      <Text
        sx={{
          fontSize: 1,
          fontWeight: 'bold',
          color: getCountColor(count),
        }}>
        {count}
      </Text>

      <Flex
        sx={{
          alignItems: 'center',
          cursor: user ? 'pointer' : 'not-allowed',
          opacity: user ? 1 : 0.5,
        }}
        onClick={() => user && handleVote('down')}>
        <ChevronDownIcon
          size={20}
          color={voted === -1 ? 'red' : 'gray'}
          strokeWidth={voted === -1 ? 2.5 : 1.5}
        />
      </Flex>
    </Flex>
  );
};

export default ThemeVoteComponent;
