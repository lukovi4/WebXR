import { memo } from 'react';
import { Container, Image, Text, Svg } from '@react-three/uikit';

export default memo(function Header({
  height = 250,
  paddingX = 40,
  logoHeight = 200,
  marginTop = 0,
  marginBottom = 0,
  isAbsolute = false,
}) {
  return (
    <Container
      width={isAbsolute ? undefined : "100%"}
      height={height}
      flexShrink={0}
      flexDirection="row"
      alignItems="center"
      paddingX={isAbsolute ? 0 : paddingX}
      marginTop={isAbsolute ? 0 : marginTop}
      marginBottom={isAbsolute ? 0 : marginBottom}
      positionType={isAbsolute ? 'absolute' : undefined}
      positionTop={isAbsolute ? paddingX : undefined}
      positionLeft={isAbsolute ? paddingX : undefined}
      positionRight={isAbsolute ? paddingX : undefined}
      zIndex={isAbsolute ? 100 : undefined}
    >
      {/* Логотип слева */}
      <Container
        height={logoHeight}
        aspectRatio={580 / 136}
        flexShrink={0}
      >
        <Image
          src={`${import.meta.env.BASE_URL}images/logo.png`}
          width="100%"
          height="100%"
        />
      </Container>

      {/* Поиск - абсолютно центрированный по всей ширине */}
      <Container
        positionType="absolute"
        positionLeft="50%"
        positionTop="50%"
        height={200}
        width={2000}
        transformTranslateX={-1000}
        transformTranslateY={-100}
        backgroundColor="#3A3A3A"
        borderRadius={100}
        flexDirection="row"
        alignItems="center"
        paddingX={80}
        gap={50}
        zIndex={1}
      >
        <Svg src={`${import.meta.env.BASE_URL}icons/Svg/search_icon.svg`} width={80} height={80} color="#999999" />
        <Text fontSize={70} color="#999999" fontWeight={500}>
          Search videos...
        </Text>
      </Container>

      {/* Кнопка Sign In справа */}
      <Container
        height={200}
        paddingX={120}
        flexShrink={0}
        backgroundColor="#ff6b35"
        borderRadius={100}
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
        marginLeft="auto"
      >
        <Text fontSize={70} color="white" fontWeight={700}>
          Sign In
        </Text>
      </Container>
    </Container>
  );
});
