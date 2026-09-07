import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../src/lib/store';
import { Language, translate } from '../src/lib/i18n';
import { T } from '../src/lib/theme';
import { Card, Btn, Ring } from '../src/components/UI';
import { DAY, forecast, retention } from '../src/lib/srs';

type TopicStat = {
  label: string;
  deckId?: string;
  total: number;
  weakCount: number;
  weakness: number;
};

export default function Settings() {
  const st = useStore();
  const ins = useSafeAreaInsets();
  const [key, setKey] = useState('');
  const t = (keyName: string, vars?: Record<string, string | number>) => translate(st.language, keyName, vars);

  const daysLeft = Math.max(0, Math.ceil((st.examDate - Date.now()) / DAY));
  const topics = useMemo<TopicStat[]>(() => {
    const groups = new Map<string, { label: string; deckId?: string; total: number; weakCount: number; retention: number }>();

    st.cards.forEach((card) => {
      const deck = st.decks.find((item) => item.id === card.deckId);
      const label = card.topic?.trim() || deck?.name || deck?.subject || 'General';
      const previous = groups.get(label) ?? { label, deckId: deck?.id, total: 0, weakCount: 0, retention: 0 };
      const cardRetention = card.reps === 0 ? 0 : retention(card) * 100;
      previous.total += 1;
      previous.retention += cardRetention;
      // New, overdue, low-retention and lapsed cards are useful weakness signals.
      if (card.reps === 0 || card.due <= Date.now() || card.lapses > 0 || cardRetention < 60) {
        previous.weakCount += 1;
      }
      groups.set(label, previous);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        weakness: Math.round(100 - group.retention / Math.max(1, group.total)),
      }))
      .sort((a, b) => b.weakness - a.weakness || b.weakCount - a.weakCount);
  }, [st.cards, st.decks]);

  if (!st.ready) return null;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingTop: ins.top + 12, gap: 14, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={{ color: T.sub, fontSize: 15 }}>{t('common.back')}</Text>
      </Pressable>
      <Text style={s.title}>{t('settings.title')}</Text>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <Ring pct={forecast(st.cards, st.examDate)} size={96} stroke={10} />
        <View style={{ flex: 1, gap: 6 }}>
          <Row k={t('settings.streak')} v={`${st.stats.streak} ${t('common.days')} 🔥`} />
          <Row k={t('settings.totalReviews')} v={String(st.stats.totalReviews)} />
          <Row k="XP" v={String(st.stats.xp)} />
          <Row k={t('settings.plan')} v={st.isPro ? t('common.pro') : t('common.free')} />
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={s.sec}>{t('settings.examDate')}</Text>
        <Text style={{ color: T.sub, fontSize: 13.5 }}>
          {t('settings.daysAway', { count: daysLeft })}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[30, 60, 90, 180].map((d) => (
            <Pressable
              key={d}
              onPress={() => st.setExamDate(Date.now() + d * DAY)}
              style={[s.chip, Math.abs(daysLeft - d) < 2 && { borderColor: T.accent, backgroundColor: T.accent + '22' }]}
            >
              <Text style={{ color: Math.abs(daysLeft - d) < 2 ? T.accent : T.sub, fontWeight: '700', fontSize: 13 }}>
                {d}d
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.sec}>{t('settings.language')}</Text>
            <Text style={{ color: T.sub, fontSize: 12.5, lineHeight: 18, marginTop: 3 }}>
              {t('settings.languageHint')}
            </Text>
          </View>
          <Text style={{ fontSize: 24 }}>अ</Text>
        </View>
        <View style={s.languageRow}>
          <LanguageOption
            label={t('settings.english')}
            selected={st.language === 'en'}
            onPress={() => st.setLanguage('en')}
          />
          <LanguageOption
            label={t('settings.hindi')}
            selected={st.language === 'hi'}
            onPress={() => st.setLanguage('hi')}
          />
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.sec}>{t('heatmap.title')}</Text>
          {!!topics.length && (
            <Text style={{ color: T.bad, fontSize: 11.5, fontWeight: '700' }}>
              {t('heatmap.topicsNeedWork', { count: topics.filter((topic) => topic.weakness >= 55).length })}
            </Text>
          )}
        </View>
        <Text style={{ color: T.sub, fontSize: 12.5, lineHeight: 18 }}>
          {t('heatmap.description')}
        </Text>

        {topics.length ? (
          <View style={s.heatGrid}>
            {topics.map((topic) => {
              const color = heatColor(topic.weakness);
              return (
                <Pressable
                  key={topic.label}
                  onPress={() => topic.deckId && router.push(`/deck/${topic.deckId}`)}
                  style={[s.topicCell, { backgroundColor: color + '20', borderColor: color + '70' }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                    <Text style={s.topicName} numberOfLines={1}>{topic.label}</Text>
                    <Text style={{ color, fontWeight: '900', fontSize: 12 }}>{topic.weakness}%</Text>
                  </View>
                  <View style={s.heatTrack}>
                    <View style={[s.heatFill, { width: `${Math.max(4, topic.weakness)}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={{ color: T.sub, fontSize: 11.5 }}>
                    {t('heatmap.cardsWeak', { count: topic.weakCount })} · {topic.total} {t('common.cards')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={{ color: T.dim, fontSize: 13 }}>{t('heatmap.noData')}</Text>
        )}

        <View style={s.legend}>
          <Legend color={T.good} label={t('heatmap.strong')} />
          <Legend color={T.warn} label={t('heatmap.warming')} />
          <Legend color={T.bad} label={t('heatmap.weak')} />
          <Legend color="#9B4DFF" label={t('heatmap.priority')} />
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={s.sec}>{t('settings.aiTitle')}</Text>
        <Text style={{ color: T.sub, fontSize: 13, lineHeight: 19 }}>
          {t('settings.aiDescription')}
        </Text>
        {st.geminiKey ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: T.good, fontSize: 13, flex: 1 }}>
              {t('settings.keySaved', { last4: st.geminiKey.slice(-4) })}
            </Text>
            <Pressable onPress={() => st.setGeminiKey('')}>
              <Text style={{ color: T.bad, fontSize: 13 }}>{t('settings.remove')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              placeholder={t('settings.keyPlaceholder')}
              placeholderTextColor={T.dim}
              value={key}
              onChangeText={setKey}
              autoCapitalize="none"
              autoCorrect={false}
              style={s.input}
            />
            <Btn label={t('settings.saveKey')} variant="soft" onPress={() => { st.setGeminiKey(key); setKey(''); }} />
            <Text style={{ color: T.dim, fontSize: 11.5, lineHeight: 17 }}>
              {t('settings.keyHelp')}
            </Text>
          </>
        )}
      </Card>

      {!st.isPro ? (
        <Btn label={t('settings.upgrade')} onPress={() => router.push('/paywall')} />
      ) : (
        <Card style={{ borderColor: T.gold + '55' }}>
          <Text style={{ color: T.gold, fontWeight: '800' }}>{t('settings.active')}</Text>
          <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>{t('settings.activeHint')}</Text>
        </Card>
      )}

      <Pressable onPress={st.reset} style={{ marginTop: 20 }}>
        <Text style={{ color: T.bad, textAlign: 'center', fontSize: 13 }}>{t('settings.reset')}</Text>
      </Pressable>
      <Text style={{ color: T.dim, fontSize: 11, textAlign: 'center' }}>
        {t('settings.version')}
      </Text>
    </ScrollView>
  );
}

function heatColor(weakness: number) {
  if (weakness >= 85) return '#9B4DFF';
  if (weakness >= 65) return T.bad;
  if (weakness >= 40) return T.warn;
  return T.good;
}

function LanguageOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.languageOption, selected && { backgroundColor: T.accent + '24', borderColor: T.accent }]}
    >
      <View style={[s.radio, selected && { backgroundColor: T.accent, borderColor: T.accent }]}>
        {selected && <View style={s.radioDot} />}
      </View>
      <Text style={{ color: selected ? T.text : T.sub, fontSize: 13.5, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ color: T.dim, fontSize: 10.5 }}>{label}</Text>
    </View>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: T.dim, fontSize: 13.5 }}>{k}</Text>
      <Text style={{ color: T.text, fontSize: 13.5, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  title: { color: T.text, fontSize: 27, fontWeight: '800' },
  sec: { color: T.text, fontSize: 16, fontWeight: '800' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.bg2,
  },
  languageRow: { flexDirection: 'row', gap: 8 },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.bg2,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: T.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#fff' },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicCell: {
    width: '48%',
    minHeight: 91,
    borderRadius: 13,
    borderWidth: 1,
    padding: 11,
    justifyContent: 'space-between',
    gap: 8,
  },
  topicName: { color: T.text, fontSize: 12.5, fontWeight: '700', flex: 1 },
  heatTrack: { height: 6, borderRadius: 9, backgroundColor: T.line, overflow: 'hidden' },
  heatFill: { height: 6, borderRadius: 9 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  input: {
    backgroundColor: T.bg2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.line,
    color: T.text,
    padding: 13,
    fontSize: 14,
  },
});
