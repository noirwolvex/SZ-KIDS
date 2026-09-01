import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShoppingBag, Sparkles, Check, Lock, Coins, User, Palette, Sticker } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button, Skeleton, showToast } from '@/components/ui';
import { useProfile, useShop } from '@/lib/hooks';
import { SHOP_ITEMS } from '@/lib/db';
import type { ShopItem } from '@/lib/db';

const TABS = [
  { id: 'avatar', label: 'Avatars', icon: User },
  { id: 'theme', label: 'Themes', icon: Palette },
  { id: 'sticker', label: 'Stickers', icon: Sticker },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Shop() {
  const [tab, setTab] = useState<TabId>('avatar');
  const { profile, loading: profileLoading, refresh: refreshProfile } = useProfile();
  const { purchases, loading: shopLoading, purchase, equip } = useShop();
  const [busy, setBusy] = useState<string | null>(null);

  const coins = profile?.coins ?? 0;
  const currentAvatar = profile?.avatar ?? '🦊';

  const items = SHOP_ITEMS.filter((i) => i.type === tab);

  const handlePurchase = async (item: ShopItem) => {
    setBusy(item.key);
    try {
      const result = await purchase(item.key);
      if (result.success) {
        showToast(`${item.name} unlocked!`, 'success', item.emoji);
        await refreshProfile();
      } else {
        showToast(result.error || 'Could not purchase', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleEquip = async (item: ShopItem) => {
    setBusy(item.key);
    try {
      await equip(item.key, item.type);
      await refreshProfile();
      showToast(`${item.name} equipped!`, 'success', item.emoji);
    } catch {
      showToast('Could not equip item', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />

      <div className="relative pt-24 pb-20 md:pb-12 px-4">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative inline-flex items-center justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl bg-lemon-200/50 blur-xl"
              />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-lemon-200 to-peach-200 flex items-center justify-center shadow-soft">
                <ShoppingBag className="text-peach-500" size={36} />
              </div>
            </div>
            <h1 className="font-display text-fluid-h1 font-bold text-lavender-500">
              Reward Shop
            </h1>
            <p className="text-lavender-400 mt-2 text-base">
              Spend your coins on cool stuff!
            </p>

            {/* Coin balance */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-lemon-100 to-peach-100 border border-lemon-200 shadow-soft"
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl"
              >
                🪙
              </motion.span>
              <span className="font-display font-bold text-xl text-lemon-500">
                {profileLoading ? '...' : coins.toLocaleString()}
              </span>
              <span className="text-sm text-lemon-500 font-semibold">coins</span>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-display font-semibold text-sm transition-colors touch-target-sm ${
                    active ? 'text-white' : 'text-lavender-400 hover:text-lavender-500'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="shop-tab"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 shadow-soft"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon size={18} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {shopLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-4xl overflow-hidden shadow-soft">
                  <Skeleton className="aspect-[4/3] rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => {
                  const owned = purchases.has(item.key);
                  const isCurrentAvatar = item.type === 'avatar' && currentAvatar === item.value;
                  const canAfford = coins >= item.price;
                  const isBusy = busy === item.key;

                  return (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-4xl shadow-soft overflow-hidden flex flex-col"
                    >
                      {/* Visual */}
                      <div className={`relative aspect-[4/3] bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <motion.span
                          className="text-5xl"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {item.emoji}
                        </motion.span>
                        {owned && (
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-mint-400 flex items-center justify-center shadow-soft">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        {item.price === 0 && !owned && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/80 text-xs font-display font-bold text-mint-500">
                            Free
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
                        <h3 className="font-display font-bold text-lavender-500 text-sm line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-lavender-400 mt-1 flex-1 line-clamp-2">{item.description}</p>

                        {/* Action */}
                        <div className="mt-3">
                          {owned ? (
                            isCurrentAvatar ? (
                              <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-mint-100 text-mint-500 font-display font-semibold text-sm">
                                <Check size={16} /> Equipped
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="w-full"
                                disabled={isBusy}
                                onClick={() => handleEquip(item)}
                              >
                                Equip
                              </Button>
                            )
                          ) : (
                            <button
                              onClick={() => handlePurchase(item)}
                              disabled={isBusy || !canAfford}
                              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-display font-semibold text-sm transition-all touch-target-sm ${
                                canAfford
                                  ? 'bg-gradient-to-r from-lemon-200 to-peach-200 text-peach-500 hover:shadow-soft'
                                  : 'bg-lavender-100 text-lavender-300 cursor-not-allowed'
                              }`}
                            >
                              {isBusy ? (
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                  className="w-4 h-4 rounded-full border-2 border-peach-300 border-t-transparent"
                                />
                              ) : canAfford ? (
                                <>
                                  <Coins size={16} />
                                  {item.price}
                                </>
                              ) : (
                                <>
                                  <Lock size={14} />
                                  {item.price}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-lavender-400"
          >
            <Sparkles size={16} className="text-lemon-400" />
            <span>Play more games to earn more coins!</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
