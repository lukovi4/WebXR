import { useRef, useEffect, memo } from 'react';
import { Container, Image, Text } from '@react-three/uikit';
import { useOptimizedTexture } from '../hooks/useOptimizedTexture';

export default memo(function VideoCard({
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
  // Настройки грида (влияют на размер карточки)
  gridPaddingX = 40,
  gridCardGap = 32,
  // Настройки панели (влияют на размер карточки через flexbox)
  panelWidth = 1.41,
  panelHeight = 0.79,
  // Callback для передачи размеров наружу
  onSizeMeasured,
}) {
  const rootRef = useRef();
  const previewRef = useRef();

  // Храним последние отправленные значения в ref (сохраняются между рендерами)
  const lastSentWidth = useRef(null);
  const lastSentHeight = useRef(null);

  // Загружаем оптимизированную текстуру
  const optimizedTexture = useOptimizedTexture(thumbnailUrl);

  // Постоянный мониторинг размеров карточки для синхронизации с каруселью
  useEffect(() => {
    if (!onSizeMeasured) return;

    let checkCount = 0;
    let timeoutId;

    const checkSize = () => {
      if (rootRef.current?.size) {
        const rootSize = rootRef.current.size.peek();
        if (rootSize) {
          const [width, height] = rootSize;
          const widthDiff = Math.abs(width - (lastSentWidth.current || 0));
          const heightDiff = Math.abs(height - (lastSentHeight.current || 0));

          if (widthDiff > 0.5 || heightDiff > 0.5) {
            console.log('[VideoCard] Size changed:', { width, height, lastWidth: lastSentWidth.current, lastHeight: lastSentHeight.current });
            lastSentWidth.current = width;
            lastSentHeight.current = height;
            onSizeMeasured(width, height);
            return; // Размер изменился, всё ОК
          }
        }
      }

      // Если размер не изменился, пробуем еще раз (максимум 10 попыток)
      checkCount++;
      if (checkCount < 10) {
        timeoutId = setTimeout(checkSize, 16); // Проверяем каждые 16мс (1 фрейм)
      }
    };

    // Начинаем проверку после небольшой задержки
    timeoutId = setTimeout(checkSize, 32);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [onSizeMeasured, cardTitleSize, cardDescriptionSize, cardDurationSize,
      cardPreviewTitleGap, cardTitleDescriptionGap, cardImageBorderRadius,
      gridPaddingX, gridCardGap, panelWidth, panelHeight]);

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
});
