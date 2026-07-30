import { useEffect, useState } from 'react';
import styles from './home.module.less';
import { useHistory } from 'react-router';
import Header from '@components/header';
import Footer from '@components/footer';
import { Button } from '@douyinfe/semi-ui';
import { user } from '@stores/user';
import { pubsub } from '@utils/pubsub';
import VipRecharge from '@pages/editor/components/header/VipRecharge';

const aiFeatures = [
  {
    emoji: '/assets/images/ico1.png',
    title: 'AI自动识别素材内容',
    desc: '智能识别上传素材中的情绪、场景、人脸等信息，自动打标签分类',
  },
  { emoji: '/assets/images/ico2.png', title: 'AI自动剪辑', desc: '根据素材内容智能生成精彩片段，一键生成初剪版本' },
  { emoji: '/assets/images/ico3.png', title: 'AI自动生成字幕', desc: '识别音频数据自动生成精准时间轴字幕，支持多语言' },
  { emoji: '/assets/images/ico4.png', title: 'AI文字转语音', desc: '输入文字即可生成自然流畅的配音，多种音色可选' },
  { emoji: '/assets/images/ico5.png', title: 'AI自动生成图片', desc: '通过文字描述生成高质量图片素材，丰富创作内容' },
  { emoji: '/assets/images/ico6.png', title: 'AI自动生成视频', desc: '文字/图片一键生成视频，AI智能生成创意内容' },
  { emoji: '/assets/images/ico7.png', title: 'AI人像分离', desc: '智能分离人物与背景，轻松实现抠图换背景效果' },
  { emoji: '/assets/images/ico8.png', title: '更多AI功能持续集成中...', desc: '持续接入最新AI能力，不断扩展创作边界' },
];

const allFeatures = [
  '花字',
  '字体',
  '字幕',
  '视频',
  '图片',
  '音频',
  '镜头',
  '特效',
  '贴纸',
  '转场',
  '滤镜',
  '绿幕',
  '遮罩',
  '动画',
  'TTS',
  '混音',
  '语音识别',
  'seedance',
  'deepseek',
  '二维码',
  '插件扩展',
  '逐字动画',
  '关键帧',
  '绿幕抠图',
  '人像分离',
  '钢笔工具',
  '文生视频',
  '图生视频',
  '文生图',
  '图生图',
  'AI剪辑',
];

const coreFeatures = [
  {
    label: 'Template',
    title: '模板功能',
    desc: '一键使用模板，快速替换素材，零门槛出片。无论你是新手还是专业创作者，都能快速找到适合的模板。',
    emoji: '📋',
  },
  {
    label: 'Editor',
    title: '时间轴编辑',
    desc: '多轨道编辑，自由裁剪、批量处理。专业级时间轴操作体验，精准掌控每一帧。',
    emoji: '⏱️',
  },
  {
    label: 'Camera',
    title: '镜头控制',
    desc: '支持复杂的镜头控制功能，轻松实现专业级运镜效果。推拉摇移，尽在掌控。',
    emoji: '📹',
  },
  {
    label: 'Animation',
    title: '关键帧动画',
    desc: '强大的自定义元素关键帧动画，可制作复杂的动画效果。让静态元素动起来，提升视频表现力。',
    emoji: '🔑',
  },
  {
    label: 'Security',
    title: '隐私安全',
    desc: '数据存放在本地，无需上传服务端，数据安全可靠。端到端加密，你的创作内容只属于你自己。',
    emoji: '🛡️',
  },
  {
    label: 'Value',
    title: '经济实惠',
    desc: '且会员和非会员只有AI功能的差别（第三方AI服务收费，所以我们只提供基础功能），我们承诺：素材终身全免费。',
    emoji: '💰',
  },
];

const faqList = [
  {
    q: '无界云剪辑是免费的吗？',
    a: '无界云剪辑提供免费基础功能，用户可以免费使用核心剪辑工具。高级AI功能和特效模板需要VIP解锁，按需购买，灵活选择。',
  },
  {
    q: '需要安装客户端吗？',
    a: '不需要。无界云剪辑是纯B/S架构，打开浏览器即可使用，无需下载任何客户端。支持Chrome、Firefox、Safari等主流浏览器。',
  },
  {
    q: '推荐使用什么浏览器？',
    a: '推荐使用最新版本的Chrome浏览器以获得最佳体验。Firefox和Safari也完全支持，但部分高级特效可能在Chrome上表现更好。',
  },
  {
    q: '支持什么格式的文件？',
    a: '支持主流视频格式（MP4、MOV、AVI、MKV等）、图片格式（JPG、PNG、WebP等）和音频格式（MP3、WAV、AAC等）。导出支持MP4格式。',
  },
  {
    q: '导出的视频支持什么分辨率和格式？',
    a: '支持最高4K分辨率导出，格式为MP4（H.264编码）。免费版支持720P导出，VIP版支持1080P和4K导出。',
  },
  {
    q: '可以商用吗？有版权风险吗？',
    a: '使用无界云剪辑制作的视频可以商用。平台提供的音乐、素材均来源第三方免版权素材网，请在使用时遵守相关版权法律。AI生成内容的版权归属请参考用户协议。',
  },
];

const freeFeatures = [
  { text: '花字 / 字幕 / 贴纸 / 转场', enabled: true },
  { text: '视频 / 图片 / 音频编辑', enabled: true },
  { text: '特效 / 滤镜 / 动画', enabled: true },
  { text: '绿幕 / 遮罩 / 绿幕抠图', enabled: true },
  { text: '部分素材免费', enabled: true },
  { text: '时间轴多轨道编辑', enabled: true },
  { text: '镜头控制', enabled: true },
  { text: '关键帧 / 逐字动画', enabled: true },
  { text: '混音 / 人像分离', enabled: true },
  { text: '最高支持4K导出', enabled: true },
  { text: 'AI人像分离', enabled: true },
  { text: 'AI图片变清晰', enabled: true },
  { text: 'AI一键抠图', enabled: true },
  // VIP功能
  { text: 'AI生成图片/视频', enabled: false },
  { text: 'AI字幕识别', enabled: false },
  { text: 'AI文字转语音', enabled: false },
  { text: 'AI素材识别', enabled: false },
  { text: 'AI自动剪辑', enabled: false },
  { text: 'AI人像分离', enabled: false },
  { text: '客服支持', enabled: false },
];

const vipFeatures = [
  { text: '花字 / 字幕 / 贴纸 / 转场', enabled: true },
  { text: '视频 / 图片 / 音频编辑', enabled: true },
  { text: '特效 / 滤镜 / 动画', enabled: true },
  { text: '绿幕 / 遮罩 / 绿幕抠图', enabled: true },
  { text: '全部素材免费', enabled: true, bold: true },
  { text: '时间轴多轨道编辑', enabled: true },
  { text: '镜头控制', enabled: true },
  { text: '关键帧 / 逐字动画', enabled: true },
  { text: '混音 / 人像分离', enabled: true },
  { text: '最高支持4K导出', enabled: true },
  // { text: 'VIP全部功能', enabled: true, bold: true  },
  { text: 'AI人像分离', enabled: true },
  { text: 'AI图片变清晰', enabled: true },
  { text: 'AI一键抠图', enabled: true },
  { text: 'AI生成图片/视频', enabled: true },
  { text: 'AI字幕识别', enabled: true },
  { text: 'AI文字转语音', enabled: true },
  { text: 'AI素材识别', enabled: true },
  { text: 'AI自动剪辑', enabled: true },
  { text: 'AI人像分离', enabled: true },
  { text: '客服支持', enabled: true },
];

export default function Home() {
  const history = useHistory();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [pricingPeriod, setPricingPeriod] = useState<'month' | 'year'>('month');
  const [vipRechargeVisible, setVipRechargeVisible] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handlePricingClick = (action: 'free' | 'vip') => {
    if (!user.info) {
      pubsub.publish('showLoginModal');
      return;
    }
    if (action === 'free') {
      history.push('/workspace/draft');
    } else {
      setVipRechargeVisible(true);
    }
  };

  return (
    <div className={styles.home}>
      <Header componentName="Home" />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            新一代AI驱动 · 全功能云端剪辑
          </div>
          <h1 className={styles.heroTitle}>
            UniCut(无界云剪)
            <br />
            <span className={styles.heroHighlight}>AI驱动</span>的开源视频剪辑工具
          </h1>
          <p className={styles.heroSubtitle}>
            B/S剪辑工具中全网功能最齐全。无需安装，打开浏览器即可创作。AI全程加持，让创作更高效，免费开源。
          </p>
          <div className={styles.heroActions}>
            <Button
              theme="solid"
              size="large"
              className={styles.heroBtn}
              onClick={() => history.push('/workspace/draft')}
            >
              开始创作 →
            </Button>
            <Button theme="borderless" size="large" className={styles.heroBtnOutline}>
              观看演示
            </Button>
          </div>

          {/* Product Showcase */}
          <div className={styles.heroShowcase}>
            <div className={styles.showcaseMain}>
              <div className={styles.productUI}>
                <div className={styles.sideBar}>
                  <div className={styles.iconBlock} />
                  <div className={styles.iconBlock} />
                  <div className={styles.iconBlock} />
                  <div className={styles.iconBlock} />
                  <div className={styles.iconBlock} />
                </div>
                <div className={styles.previewArea}>
                  <div className={styles.previewMain}>视频预览区域</div>
                  <div className={styles.timelineBar}>
                    <div className={styles.clip} style={{ width: 100 }} />
                    <div className={styles.clip} style={{ width: 60, opacity: 0.5 }} />
                    <div className={styles.clip} style={{ width: 160, opacity: 0.7 }} />
                    <div className={styles.clip} style={{ width: 40, opacity: 0.3 }} />
                    <div className={styles.clip} style={{ width: 120, opacity: 0.6 }} />
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.fc1}`}>
              <div className={styles.fcLabel}>AI 识别</div>
              <div className={`${styles.fcValue} ${styles.fcValuePurple}`}>8 项AI</div>
            </div>
            <div className={`${styles.floatCard} ${styles.fc2}`}>
              <div className={styles.fcLabel}>功能元素</div>
              <div className={`${styles.fcValue} ${styles.fcValueGold}`}>12+</div>
              <div className={styles.fcBar}>
                <div className={styles.fcBarFill} style={{ width: '85%' }} />
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.fc3}`}>
              <div className={styles.fcLabel}>导出质量</div>
              <div className={`${styles.fcValue} ${styles.fcValuePurple}`}>4K</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className={styles.trustBar}>
        <p>受到众多大品牌信赖</p>
        <div className={styles.trustLogos}>
          {/* <span>
            <img src="/assets/images/zsyh.png" alt="" />
          </span> */}
          <span>
            <img src="/assets/images/kpy.png" alt="" />
          </span>
          <span>
            <img src="/assets/images/ytkd.png" alt="" />
          </span>
          <span>
            <img src="/assets/images/zgdx.png" alt="" />
          </span>
          <span>
            <img src="/assets/images/zgyd.png" alt="" />
          </span>
        </div>
      </section>

      {/* AI Features */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.overline}>Platform Features</div>
            <h2 className={styles.sectionTitle}>AI 智能功能</h2>
            <p className={styles.sectionDesc}>全方位AI能力加持，让创作更高效</p>
          </div>
          <div className={styles.featuresGrid}>
            {aiFeatures.slice(0, 7).map((item, i) => (
              <div className={styles.featureCard} key={i}>
                <div className={styles.cardPreview}>
                  <img style={{ height: 60 }} src={item.emoji} alt={item.title} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
            <div className={`${styles.featureCard} ${styles.featureCardSpan2}`}>
              <div className={`${styles.cardPreview} ${styles.cardPreviewSmall}`}>
                <img style={{ height: 60 }} src={aiFeatures[7].emoji} alt={aiFeatures[7].title} />
              </div>
              <h3>{aiFeatures[7].title}</h3>
              <p>{aiFeatures[7].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className={`${styles.section} ${styles.capabilitiesSection}`}>
        <div className={styles.container}>
          <div className={styles.overline}>Capabilities</div>
          <h2>全网功能最齐全</h2>
          <p className={styles.capabilitiesSubtitle}>B/S剪辑工具中元素支持最丰富</p>
          <div className={styles.tagsWrap}>
            {allFeatures.map((f, i) => {
              // 随机旋转角度：±0~3度
              const rotate = (Math.random() * 6 - 3).toFixed(1);
              // 随机padding：14~22px左右内边距
              const paddingX = Math.floor(Math.random() * 8 + 14);
              // 随机透明度：0.03~0.12
              const bgOpacity = (Math.random() * 0.09 + 0.03).toFixed(2);
              // 随机颜色明暗度
              const colorIndex = Math.floor(Math.random() * 3);
              const colors = ['#c4b5fd', '#a78bfa', '#8b5cf6'];
              return (
                <span
                  className={styles.tag}
                  key={i}
                  style={{
                    transform: `rotate(${rotate}deg)`,
                    paddingLeft: `${paddingX}px`,
                    paddingRight: `${paddingX}px`,
                    backgroundColor: `rgba(139, 92, 246, ${bgOpacity})`,
                    color: colors[colorIndex],
                  }}
                >
                  <span className={styles.tagDot} />
                  {f}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.coreGrid}>
            {coreFeatures.map((item, i) => (
              <div className={styles.coreCard} key={i}>
                <div className={styles.coreEmoji}>{item.emoji}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={`${styles.section} ${styles.pricingSection}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.overline}>Pricing</div>
            <h2 className={styles.sectionTitle}>收费标准</h2>
            <p className={styles.sectionDesc}>选择最适合你的方案</p>
          </div>

          <div className={styles.pricingToggle}>
            <span
              className={pricingPeriod === 'month' ? styles.activeToggle : ''}
              onClick={() => setPricingPeriod('month')}
            >
              月付
            </span>
            <span
              className={pricingPeriod === 'year' ? styles.activeToggle : ''}
              onClick={() => setPricingPeriod('year')}
            >
              年付
            </span>
          </div>

          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <div className={styles.planName}>免费版</div>
              <div className={styles.planPrice}>
                ¥0<span className={styles.planUnit}>/永久</span>
              </div>
              <div className={styles.planDesc}>基础剪辑功能，满足日常需求</div>
              <ul className={styles.planFeatures}>
                {freeFeatures.map((f, j) => (
                  <li key={j} className={!f.enabled ? styles.planFeatureDisabled : ''}>
                    {f.enabled ? (
                      <span className={styles.planCheck}>✓</span>
                    ) : (
                      <span className={styles.planCross}>✕</span>
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
              <Button theme="borderless" className={styles.pricingBtn} onClick={() => handlePricingClick('free')}>
                免费开始
              </Button>
            </div>
            <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div className={styles.planName}>VIP</div>
              <div className={styles.planPrice}>
                {pricingPeriod === 'month' ? '¥9.9' : '¥99'}
                <span className={styles.planUnit}>{pricingPeriod === 'month' ? '/月' : '/年'}</span>
              </div>
              <div className={styles.planDesc}>
                {pricingPeriod === 'month' ? '解锁全部AI能力，效率翻倍' : '日均仅需0.54元，性价比之选'}
              </div>
              <ul className={styles.planFeatures}>
                {vipFeatures.map((f, j) => (
                  <li key={j}>
                    <span className={styles.planCheck}>✓</span>
                    {f.bold ? <strong style={{ color: '#8b5cf6' }}>{f.text}</strong> : f.text}
                  </li>
                ))}
              </ul>
              <Button theme="solid" className={styles.pricingBtnPrimary} onClick={() => handlePricingClick('vip')}>
                开通VIP
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.overline}>FAQ</div>
            <h2 className={styles.sectionTitle}>常见问题</h2>
            <p className={styles.sectionDesc}>快速了解无界云剪辑的核心问题</p>
          </div>
          <div className={styles.faqList}>
            {faqList.map((item, i) => (
              <div className={`${styles.faqItem} ${activeFaq === i ? styles.faqActive : ''}`} key={i}>
                <div className={styles.faqQ} onClick={() => toggleFaq(i)}>
                  <span>{item.q}</span>
                  <span className={`${styles.faqToggle} ${activeFaq === i ? styles.faqToggleActive : ''}`}>+</span>
                </div>
                <div className={styles.faqA}>
                  <div className={styles.faqAInner}>{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.bottomCta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2>准备好开始创作了吗？</h2>
            <p className={styles.bottomCtaDesc}>打开浏览器，无需安装，即刻体验AI驱动的智能剪辑</p>
            <Button
              theme="solid"
              size="large"
              className={`${styles.heroBtn} ${styles.bottomCtaBtn}`}
              onClick={() => history.push('/workspace/draft')}
            >
              立即开始创作 →
            </Button>
          </div>
        </div>
      </section>
      <Footer />
      <VipRecharge visible={vipRechargeVisible} onCancel={() => setVipRechargeVisible(false)} />
    </div>
  );
}
