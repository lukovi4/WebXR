import { Container, Image } from '@react-three/uikit';

export default function VideoGrid() {
  // 8 изображений, используем дважды для 16 слотов (4×4 грид)
  const images = [
    '/images/1.png',
    '/images/2.png',
    '/images/3.png',
    '/images/4.png',
    '/images/5.png',
    '/images/6.png',
    '/images/7.png',
    '/images/8.png',
    '/images/1.png',
    '/images/2.png',
    '/images/3.png',
    '/images/4.png',
    '/images/5.png',
    '/images/6.png',
    '/images/7.png',
    '/images/8.png',
  ];

  return (
    <Container
      width="100%"
      height="100%"
      flexDirection="column"
      gap={20}
      paddingLeft={24}
      paddingRight={24}
      paddingTop={24}
      paddingBottom={24}
      backgroundColor="#111111"
    >
      {/* 4 ряда */}
      {[0, 1, 2, 3].map((rowIndex) => (
        <Container
          key={rowIndex}
          flexDirection="row"
          gap={20}
          width="100%"
          flexGrow={1}
        >
          {/* 4 картинки в ряд */}
          {[0, 1, 2, 3].map((colIndex) => {
            const imageIndex = rowIndex * 4 + colIndex;
            return (
              <Container
                key={colIndex}
                flexGrow={1}
                aspectRatio={16/9}
                borderRadius={8}
                overflow="hidden"
              >
                <Image
                  src={images[imageIndex]}
                  width="100%"
                  height="100%"
                />
              </Container>
            );
          })}
        </Container>
      ))}
    </Container>
  );
}
