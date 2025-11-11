import { useRef, useLayoutEffect } from 'react';
import { Container, Image, Text } from '@react-three/uikit';
import { useOptimizedTexture } from '../hooks/useOptimizedTexture';


export default function VideoCard({
  thumbnailUrl,
  title,
  studio,
  timeAgo,
  likes,
  duration,
  // Настройки дизайна
  cardTitleSize = 40,
  cardDescriptionSize = 24,
  cardDurationSize = 24,
  cardPreviewTitleGap = 8,
  cardTitleDescriptionGap = 8,
  cardImageBorderRadius = 8,
}) {
  const rootRef = useRef();
  const previewRef = useRef();

  // Загружаем оптимизированную текстуру
  const optimizedTexture = useOptimizedTexture(thumbnailUrl);

  useLayoutEffect(() => {
    // Логируем только первую карточку (Tropical Paradise)
    if (title !== 'Tropical Paradise Experience') return;

    if (previewRef.current?.size) {
      const sizeData = previewRef.current.size.peek();
      if (sizeData) {
        const [previewWidth, previewHeight] = sizeData;
        console.log('📐 Preview размер:', previewWidth.toFixed(0), '×', previewHeight.toFixed(0), 'px');
        console.log('📷 Исходное изображение: 800×448 px');
        console.log('📊 Соотношение:', (previewWidth / 800).toFixed(2) + 'x');

        if (optimizedTexture) {
          console.log('✅ Текстура загружена с анизотропией:', optimizedTexture.anisotropy);
        }
      }
    }
  });

  return (
    <Container
      ref={rootRef}
      flexGrow={1}
      flexDirection="column"
      gap={cardPreviewTitleGap}
    >
      {/* Превью изображение с duration badge */}
      <Container
        ref={previewRef}
        flexShrink={0}
        aspectRatio={16/9}
        borderRadius={cardImageBorderRadius}
        overflow="hidden"
        backgroundColor="#333333"
      >
        {/* Изображение превью с оптимизированной текстурой */}
        {optimizedTexture && (
          <Image
            src={optimizedTexture}
            width="100%"
            height="100%"
            keepAspectRatio={false}
            borderRadius={cardImageBorderRadius}
          />
        )}

        {/* Duration badge - поверх превью справа снизу */}
        <Container
          positionType="absolute"
          positionBottom={10}
          positionRight={10}
          paddingX={20}
          paddingY={12}
          borderRadius={20}
          backgroundColor="black"
          backgroundOpacity={0.8}
          zIndex={10}
        >
          <Text fontSize={cardDurationSize} color="white" fontWeight="medium">
            {duration}
          </Text>
        </Container>
      </Container>

      {/* Блок с описанием */}
      <Container
        flexDirection="column"
        gap={cardTitleDescriptionGap}
      >
        {/* Заголовок */}
        <Text
          fontSize={cardTitleSize}
          color="white"
          fontWeight="semi-bold"
        >
          {title}
        </Text>

        {/* Метаданные: Studio · 3d ago · 15k likes */}
        <Container flexDirection="row" gap={24} alignItems="center" flexShrink={0}>
          <Text fontSize={cardDescriptionSize} color="#999999" fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>
            {studio}
          </Text>
          <Container width={12} height={12} borderRadius={6} backgroundColor="#999999" flexShrink={0} />
          <Text fontSize={cardDescriptionSize} color="#999999" fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>
            {timeAgo}
          </Text>
          <Container width={12} height={12} borderRadius={6} backgroundColor="#999999" flexShrink={0} />
          <Text fontSize={cardDescriptionSize} color="#999999" fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>
            {likes}
          </Text>
        </Container>
      </Container>
    </Container>
  );
}
