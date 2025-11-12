import { useState } from 'react';
import { Container, Text } from '@react-three/uikit';

export default function DebugPanel({ settings, onUpdate, onClose, passthroughMode, togglePassthrough, headerPosition, onHeaderPositionChange }) {
  const [activeTab, setActiveTab] = useState('panel'); // 'panel' or 'card'

  // Параметр контрола с кнопками +/-
  const SettingRow = ({ label, value, onChange, min, max, step, unit = 'm', decimals = 2 }) => (
    <Container
      flexDirection="row"
      gap={12}
      alignItems="center"
      width="100%"
      marginBottom={12}
    >
      <Text fontSize={18} color="white" width={140}>
        {label}:
      </Text>

      <Container
        width={40}
        height={40}
        backgroundColor="#333333"
        borderRadius={6}
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
        onClick={() => {
          const newValue = Math.max(min, value - step);
          onChange(newValue);
        }}
      >
        <Text fontSize={24} color="white" fontWeight={700}>
          −
        </Text>
      </Container>

      <Text fontSize={20} color="#ff6b35" fontWeight={600} width={80} textAlign="center">
        {decimals === 0 ? value : value.toFixed(decimals)}{unit}
      </Text>

      <Container
        width={40}
        height={40}
        backgroundColor="#333333"
        borderRadius={6}
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
        onClick={() => {
          const newValue = Math.min(max, value + step);
          onChange(newValue);
        }}
      >
        <Text fontSize={24} color="white" fontWeight={700}>
          +
        </Text>
      </Container>
    </Container>
  );

  // Компонент таба
  const Tab = ({ id, label, active }) => (
    <Container
      flexGrow={1}
      height={44}
      backgroundColor={active ? '#ff6b35' : '#333333'}
      borderRadius={8}
      justifyContent="center"
      alignItems="center"
      cursor="pointer"
      onClick={() => setActiveTab(id)}
    >
      <Text fontSize={18} color="white" fontWeight={active ? 700 : 500}>
        {label}
      </Text>
    </Container>
  );

  return (
    <Container
      width="100%"
      height="100%"
      backgroundColor="#1a1a1a"
      borderRadius={12}
      flexDirection="column"
      overflow="hidden"
    >
      {/* Заголовок - фиксированный */}
      <Container
        flexDirection="column"
        padding={24}
        paddingBottom={16}
        flexShrink={0}
      >
        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={16}
        >
          <Text fontSize={24} color="white" fontWeight={700}>
            Settings
          </Text>

          <Container flexDirection="row" gap={8} alignItems="center">
            {/* Кнопка Passthrough */}
            <Container
              width={44}
              height={44}
              backgroundColor={passthroughMode ? '#4ade80' : '#333333'}
              borderRadius={8}
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              onClick={togglePassthrough}
            >
              <Text fontSize={24} color="white" fontWeight={600}>
                {passthroughMode ? '🌍' : '🕶️'}
              </Text>
            </Container>

            {/* Кнопка Close */}
            <Container
              width={36}
              height={36}
              backgroundColor="#333333"
              borderRadius={6}
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              onClick={onClose}
            >
              <Text fontSize={20} color="white">
                ✕
              </Text>
            </Container>
          </Container>
        </Container>

        {/* Табы */}
        <Container
          flexDirection="row"
          gap={8}
          width="100%"
        >
          <Tab id="panel" label="Panel" active={activeTab === 'panel'} />
          <Tab id="card" label="Card" active={activeTab === 'card'} />
          <Tab id="other" label="Other" active={activeTab === 'other'} />
        </Container>
      </Container>

      {/* Скроллируемый контент */}
      <Container
        flexGrow={1}
        overflow="scroll"
        scrollbarWidth={0}
        paddingX={24}
        paddingBottom={24}
      >
        {/* Контент вкладки Panel */}
        {activeTab === 'panel' && (
          <Container flexDirection="column">
          <SettingRow
            label="Panel Width"
            value={settings.panelWidth}
            onChange={(val) => onUpdate({ ...settings, panelWidth: val })}
            min={0.5}
            max={3.0}
            step={0.1}
          />

          <SettingRow
            label="Panel Height"
            value={settings.panelHeight}
            onChange={(val) => onUpdate({ ...settings, panelHeight: val })}
            min={0.3}
            max={2.0}
            step={0.1}
          />

          <SettingRow
            label="Vertical Pos"
            value={settings.verticalPosition}
            onChange={(val) => onUpdate({ ...settings, verticalPosition: val })}
            min={0.5}
            max={2.0}
            step={0.1}
          />

          <SettingRow
            label="Distance"
            value={Math.abs(settings.distance)}
            onChange={(val) => onUpdate({ ...settings, distance: -val })}
            min={1.0}
            max={5.0}
            step={0.2}
          />

          <SettingRow
            label="Rotation X"
            value={settings.rotationX * (180 / Math.PI)}
            onChange={(val) => onUpdate({ ...settings, rotationX: val * (Math.PI / 180) })}
            min={-45}
            max={45}
            step={5}
            unit="°"
          />

          <SettingRow
            label="Panel Padding"
            value={settings.gridPaddingX}
            onChange={(val) => onUpdate({ ...settings, gridPaddingX: val })}
            min={0}
            max={200}
            step={4}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Card Gap"
            value={settings.gridCardGap}
            onChange={(val) => onUpdate({ ...settings, gridCardGap: val })}
            min={0}
            max={200}
            step={4}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Row Gap"
            value={settings.gridRowGap}
            onChange={(val) => onUpdate({ ...settings, gridRowGap: val })}
            min={0}
            max={200}
            step={4}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Panel Radius"
            value={settings.panelBorderRadius}
            onChange={(val) => onUpdate({ ...settings, panelBorderRadius: val })}
            min={0}
            max={200}
            step={2}
            unit="px"
            decimals={0}
          />
          </Container>
        )}

        {/* Контент вкладки Card Design */}
        {activeTab === 'card' && (
          <Container flexDirection="column">
          <SettingRow
            label="Title Size"
            value={settings.cardTitleSize}
            onChange={(val) => onUpdate({ ...settings, cardTitleSize: val })}
            min={10}
            max={200}
            step={1}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Description"
            value={settings.cardDescriptionSize}
            onChange={(val) => onUpdate({ ...settings, cardDescriptionSize: val })}
            min={10}
            max={200}
            step={1}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Duration Size"
            value={settings.cardDurationSize}
            onChange={(val) => onUpdate({ ...settings, cardDurationSize: val })}
            min={10}
            max={200}
            step={1}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Preview Gap"
            value={settings.cardPreviewTitleGap}
            onChange={(val) => onUpdate({ ...settings, cardPreviewTitleGap: val })}
            min={0}
            max={200}
            step={2}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Title Gap"
            value={settings.cardTitleDescriptionGap}
            onChange={(val) => onUpdate({ ...settings, cardTitleDescriptionGap: val })}
            min={0}
            max={200}
            step={2}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Border Radius"
            value={settings.cardImageBorderRadius}
            onChange={(val) => onUpdate({ ...settings, cardImageBorderRadius: val })}
            min={0}
            max={200}
            step={2}
            unit="px"
            decimals={0}
          />
          </Container>
        )}

        {/* Контент вкладки Other */}
        {activeTab === 'other' && (
          <Container flexDirection="column">
          <SettingRow
            label="Section Title"
            value={settings.sectionTitleSize}
            onChange={(val) => onUpdate({ ...settings, sectionTitleSize: val })}
            min={20}
            max={200}
            step={2}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Title Gap"
            value={settings.sectionTitleBottomGap}
            onChange={(val) => onUpdate({ ...settings, sectionTitleBottomGap: val })}
            min={0}
            max={100}
            step={2}
            unit="px"
            decimals={0}
          />

          <SettingRow
            label="Section Gap"
            value={settings.sectionGap}
            onChange={(val) => onUpdate({ ...settings, sectionGap: val })}
            min={0}
            max={200}
            step={10}
            unit="px"
            decimals={0}
          />

          {/* Header Position Toggle */}
          <Container flexDirection="row" gap={12} alignItems="center" width="100%" marginBottom={12} marginTop={12}>
            <Text fontSize={18} color="white" width={140}>
              Header Pos:
            </Text>
            <Container
              width={120}
              height={40}
              backgroundColor={headerPosition === 'internal' ? '#ff6b35' : '#333333'}
              borderRadius={6}
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              onClick={() => onHeaderPositionChange('internal')}
            >
              <Text fontSize={18} color="white" fontWeight={600}>
                Internal
              </Text>
            </Container>
            <Container
              width={120}
              height={40}
              backgroundColor={headerPosition === 'external' ? '#ff6b35' : '#333333'}
              borderRadius={6}
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              onClick={() => onHeaderPositionChange('external')}
            >
              <Text fontSize={18} color="white" fontWeight={600}>
                External
              </Text>
            </Container>
          </Container>
          </Container>
        )}
      </Container>
    </Container>
  );
}
