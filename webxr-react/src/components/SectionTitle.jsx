import { memo } from 'react';
import { Container, Text } from '@react-three/uikit';

export default memo(function SectionTitle({
  text,
  bottomGap = 32,
  paddingX = 40,
  fontSize = 90,
  fontWeight = 700,
  color = 'white',
}) {
  return (
    <Container
      width="100%"
      flexShrink={0}
      paddingX={paddingX}
      paddingBottom={bottomGap}
    >
      <Text
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
      >
        {text}
      </Text>
    </Container>
  );
});
