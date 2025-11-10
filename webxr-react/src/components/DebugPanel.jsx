import { Container, Text } from '@react-three/uikit';

export default function DebugPanel({ settings, onUpdate, onClose }) {
  // Параметр контрола с кнопками +/-
  const SettingRow = ({ label, value, onChange, min, max, step, unit = 'm' }) => (
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
        {value.toFixed(2)}{unit}
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

  return (
    <Container
      width={380}
      padding={24}
      backgroundColor="#1a1a1a"
      borderRadius={12}
      flexDirection="column"
      gap={16}
    >
      {/* Заголовок */}
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={8}
      >
        <Text fontSize={24} color="white" fontWeight={700}>
          Live Settings
        </Text>

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

      {/* Настройки */}
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
    </Container>
  );
}
