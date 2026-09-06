import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { T, RADIUS } from '../lib/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Btn({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'soft';
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' && { backgroundColor: T.accent },
        variant === 'soft' && { backgroundColor: T.cardHi },
        variant === 'ghost' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: T.line },
        pressed && { opacity: 0.75, transform: [{ scale: 0.985 }] },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text style={[s.btnText, variant === 'ghost' && { color: T.sub }]}>{label}</Text>
    </Pressable>
  );
}

export function Ring({
  pct,
  size = 132,
  stroke = 12,
  label,
  sub,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={T.accent} />
            <Stop offset="1" stopColor={T.accent2} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={T.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#g)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ color: T.text, fontSize: size * 0.26, fontWeight: '800' }}>{label ?? `${pct}%`}</Text>
      {!!sub && <Text style={{ color: T.dim, fontSize: 11, marginTop: 2 }}>{sub}</Text>}
    </View>
  );
}

export function Pill({ text, color }: { text: string; color: string }) {
  return (
    <View style={[s.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

export function Bar({ pct, color = T.accent }: { pct: number; color?: string }) {
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${Math.max(2, Math.min(100, pct))}%`, backgroundColor: color }]} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: T.card,
    borderRadius: RADIUS,
    padding: 18,
    borderWidth: 1,
    borderColor: T.line,
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  barBg: { height: 8, borderRadius: 99, backgroundColor: T.line, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 99 },
});
