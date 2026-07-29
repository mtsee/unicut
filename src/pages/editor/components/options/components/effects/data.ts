import Strength from '../strength';

export const effectImages = [
  // {
  //   name: 'Pixi3DTransformFilter',
  //   image: '/assets/effect-images/blur.png',
  //   params: {
  //     rotateX: {
  //       value: 0,
  //       type: 'number',
  //       step: 0.1,
  //     },
  //     rotateY: {
  //       value: 0,
  //       type: 'number',
  //       step: 0.1,
  //     },
  //     rotateZ: {
  //       value: 0,
  //       type: 'number',
  //       step: 0.1,
  //     },
  //     viewDistance: {
  //       value: 2,
  //       type: 'number',
  //       step: 0.1,
  //     },
  //   },
  // },
  {
    name: 'DropShadowFilter2',
    image: '/assets/effect-images/drop-shadow.png',
    params: {
      color: {
        value: '#000000',
        type: 'color',
      },
      shadowAlpha: {
        value: 0.3,
        range: [0, 1],
        step: 0.01,
      },
      shadowBlur: {
        value: 10,
        range: [0, 100],
        step: 0.1,
      },
      // spriteSize: {
      //   value: 1,
      //   range: [0, 10],
      //   step: 0.1,
      // },
      offsetX: {
        value: 2,
        range: [-100, 100],
        step: 0.1,
      },
      offsetY: {
        value: 2,
        range: [-100, 100],
        step: 0.1,
      },
    },
  },
  // {
  //   name: 'LightingFilter',
  //   image: '/assets/effect-images/blur.png',
  //   params: {
  //     angle: {
  //       value: 1.4,
  //       range: [0, Math.PI * 2],
  //       step: 0.01,
  //     },
  //     softness: {
  //       value: 0.05,
  //       range: [0, 1],
  //       step: 0.01,
  //     },
  //     lightRatio: {
  //       value: 0,
  //       range: [-1, 1],
  //       step: 0.01,
  //     },
  //     lightColor: {
  //       value: '#ffffff',
  //       type: 'color',
  //     },
  //   },
  // },
  // {
  //   name: 'RimLightFilter',
  //   image: '/assets/effect-images/blur.png',
  //   params: {
  //     angle: {
  //       value: 1.57,
  //       range: [0, Math.PI * 2],
  //       step: 0.1,
  //     },
  //     darkSize: {
  //       value: 0.4,
  //       range: [0, 1],
  //       step: 0.1,
  //     },
  //     darkOffset: {
  //       value: 0.5,
  //       range: [-1, 1],
  //       step: 0.1,
  //     },
  //     // size: {
  //     //   value: 5,
  //     //   range: [0, 10],
  //     //   step: 0.1,
  //     // },
  //     color: {
  //       value: '#ffffff',
  //       type: 'color',
  //     },
  //     // quality: {
  //     //   value: 100,
  //     //   range: [0, 100],
  //     //   step: 1,
  //     // },
  //   },
  // },
  {
    name: 'BlurFilter',
    image: '/assets/effect-images/blur.png',
    params: {
      blur: {
        value: 10,
        range: [0, 100],
        step: 0.1,
      },
      quality: {
        value: 10,
        range: [0, 10],
        step: 1,
      },
    },
  },
  {
    name: 'AdjustmentFilter',
    image: '/assets/effect-images/adjustment.png',
    params: {
      gamma: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      saturation: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      contrast: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      brightness: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      red: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      green: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      blue: {
        value: 1,
        range: [0, 5],
        step: 0.01,
      },
      alpha: {
        value: 1,
        range: [0, 1],
        step: 0.01,
      },
    },
  },
  {
    name: 'AdvancedBloomFilter',
    image: '/assets/effect-images/advanced-bloom.png',
    params: {
      threshold: {
        value: 0.5,
        range: [0.1, 0.9],
        step: 0.01,
      },
      bloomScale: {
        value: 1,
        range: [0.5, 1.5],
        step: 0.01,
      },
      brightness: {
        value: 0.5,
        range: [0.5, 1.5],
        step: 0.01,
      },
      blur: {
        value: 10,
        range: [0, 20],
        step: 1,
      },
      quality: {
        value: 10,
        range: [1, 20],
        step: 1,
      },
    },
  },
  // {
  //   name: 'AlphaFilter',
  //   image: '/assets/effect-images/alpha.png',
  // },
  {
    name: 'AsciiFilter',
    image: '/assets/effect-images/ascii.png',
    params: {
      size: {
        value: 8,
        range: [2, 20],
        step: 0.1,
      },
      // color: {
      //   value: '#ffffff',
      //   type: 'color',
      // },
      // replaceColor: {
      //   value: true,
      //   type: 'boolean',
      // },
    },
  },
  // {
  //   name: 'BackdropBlurFilter',
  //   image: '/assets/effect-images/backdrop-blur.png',
  //   params: {
  //     blur: {
  //       value: 50,
  //       range: [0, 100],
  //       step: 0.1,
  //     },
  //     quality: {
  //       value: 4,
  //       range: [1, 10],
  //       step: 0.1,
  //     },
  //   },
  // },
  {
    name: 'BevelFilter',
    image: '/assets/effect-images/bevel.png',
    params: {
      rotation: {
        value: 22.5,
        range: [0, 360],
        step: 0.1,
      },
      thickness: {
        value: 2.9,
        range: [0, 100],
        step: 0.1,
      },
      lightColor: {
        value: '#ffffff',
        type: 'color',
      },
      lightAlpha: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      shadowColor: {
        value: '#000000',
        type: 'color',
      },
      shadowAlpha: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
    },
  },
  // {
  //   name: 'BloomFilter',
  //   image: '/assets/effect-images/bloom.png',
  //   params: {
  //     value: {
  //       value: 5,
  //       range: [0, 20],
  //       step: 0.1,
  //     },
  //     strength_x: {
  //       value: 3.5,
  //       range: [0, 20],
  //       step: 0.1,
  //     },
  //     strength_y: {
  //       value: 6,
  //       range: [0, 20],
  //       step: 0.1,
  //     },
  //   },
  // },
  {
    name: 'BulgePinchFilter',
    image: '/assets/effect-images/bulge-pinch.png',
    params: {
      radius: {
        value: 5,
        range: [0, 2000],
        step: 1,
      },
      strength: {
        value: 1,
        range: [-1, 1],
        step: 0.1,
      },
      center_x: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      center_y: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
    },
  },
  // {
  //   name: 'ColorGradientFilter',
  //   image: '/assets/effect-images/color-gradient.png',
  // },
  // {
  //   name: 'ColorMapFilter',
  //   image: '/assets/effect-images/color-map.png',
  // },
  {
    name: 'ColorOverlayFilter',
    image: '/assets/effect-images/color-overlay.png',
    params: {
      alpha: {
        value: 1,
        range: [0, 1],
        step: 0.01,
      },
      color: {
        value: '#ffffff',
        type: 'color',
      },
    },
  },
  {
    name: 'ColorReplaceFilter',
    image: '/assets/effect-images/color-replace.png',
    params: {
      originalColor: {
        value: '#ffffff',
        type: 'color',
      },
      targetColor: {
        value: '#000000',
        type: 'color',
      },
      tolerance: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
    },
  },
  // {
  //   name: 'ConvolutionFilter',
  //   image: '/assets/effect-images/convolution.png',
  // },
  // {
  //   name: 'CrossHatchFilter',
  //   image: '/assets/effect-images/cross-hatch.png',
  // },
  {
    name: 'CRTFilter',
    image: '/assets/effect-images/crt.png',
    params: {
      animating: {
        value: true,
        type: 'boolean',
      },
      curvature: {
        value: 5,
        range: [0, 10],
        step: 0.1,
      },
      lineWidth: {
        value: 1,
        range: [0, 5],
        step: 0.1,
      },
      lineContrast: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      verticalLine: {
        value: true,
        type: 'boolean',
      },
      noise: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      noiseSize: {
        value: 5,
        range: [1, 10],
        step: 0.1,
      },
      vignetting: {
        value: 5,
        range: [0, 1],
        step: 0.01,
      },
      vignettingAlpha: {
        value: 0,
        range: [0, 1],
        step: 0.01,
      },
      vignettingBlur: {
        value: 0,
        range: [0, 1],
        step: 0.01,
      },
      seed: {
        value: 0,
        range: [0, 1],
        step: 0.01,
      },
      time: {
        value: 0,
        range: [0, 20],
        step: 0.1,
      },
    },
  },
  // {
  //   name: 'DisplacementFilter',
  //   image: '/assets/effect-images/displacement.png',
  //   params: {
  //     scale_x: {
  //       value: 0,
  //       range: [1, 200],
  //       step: 0.1,
  //     },
  //     scale_y: {
  //       value: 0,
  //       range: [1, 200],
  //       step: 0.1,
  //     },
  //   },
  // },
  {
    name: 'DotFilter',
    image: '/assets/effect-images/dot.png',
    params: {
      scale: {
        value: 5,
        range: [0.3, 1],
        step: 0.01,
      },
      angle: {
        value: 2,
        range: [0, 5],
        step: 0.1,
      },
      grayscale: {
        value: false,
        type: 'boolean',
      },
    },
  },
  {
    name: 'DropShadowFilter',
    image: '/assets/effect-images/drop-shadow.png',
    params: {
      blur: {
        value: 5,
        range: [0, 20],
        step: 0.1,
      },
      quality: {
        value: 5,
        range: [1, 20],
        step: 1,
      },
      alpha: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      offset_x: {
        value: 0,
        range: [-50, 50],
        step: 1,
      },
      offset_y: {
        value: 0,
        range: [-50, 50],
        step: 1,
      },
      color: {
        value: '#000000',
        type: 'color',
      },
      shadowOnly: {
        value: false,
        type: 'boolean',
      },
    },
  },
  {
    name: 'EmbossFilter',
    image: '/assets/effect-images/emboss.png',
    params: {
      strength: {
        value: 10,
        range: [0, 20],
        step: 1,
      },
    },
  },
  // {
  //   name: 'GlitchFilter',
  //   image: '/assets/effect-images/glitch.png',
  // },
  {
    name: 'GlowFilter',
    image: '/assets/effect-images/glow.png',
    params: {
      distance: {
        value: 10,
        range: [0, 20],
        step: 1,
      },
      color: {
        value: '#ffffff',
        type: 'color',
      },
      innerStrength: {
        value: 10,
        range: [0, 20],
        step: 1,
      },
      outerStrength: {
        value: 10,
        range: [0, 20],
        step: 1,
      },
      quality: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      opacity: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      knockout: {
        value: false,
        type: 'boolean',
      },
    },
  },
  // {
  //   name: 'GodrayFilter',
  //   image: '/assets/effect-images/godray.png',
  // },
  // {
  //   name: 'GrayscaleFilter',
  //   image: '/assets/effect-images/grayscale.png',
  // },
  {
    name: 'HslAdjustmentFilter',
    image: '/assets/effect-images/hsl-adjustment.png',
    params: {
      hue: {
        value: 0,
        range: [-180, 180],
        step: 1,
      },
      saturation: {
        value: 0,
        range: [-1, 1],
        step: 0.01,
      },
      lightness: {
        value: 0,
        range: [-1, 1],
        step: 0.01,
      },
      colorrize: {
        value: false,
        type: 'boolean',
      },
      alpha: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
    },
  },
  {
    name: 'KawaseBlurFilter',
    image: '/assets/effect-images/kawase-blur.png',
    params: {
      strength: {
        value: 5,
        range: [0, 20],
        step: 0.1,
      },
      quality: {
        value: 1,
        range: [1, 20],
        step: 1,
      },
      pixelSize_x: {
        value: 0,
        range: [0, 10],
        step: 0.1,
      },
      pixelSize_y: {
        value: 0,
        range: [0, 10],
        step: 0.1,
      },
    },
  },
  {
    name: 'MotionBlurFilter',
    image: '/assets/effect-images/motion-blur.png',
    params: {
      velocity_x: {
        value: 10,
        range: [-100, 100],
        step: 0.1,
      },
      velocity_y: {
        value: 10,
        range: [-100, 100],
        step: 0.1,
      },
      kernelSize: {
        type: 'option',
        value: 5,
        options: [3, 5, 9, 11, 13, 15, 17, 21, 23, 25],
      },
      offset: {
        value: 0,
        range: [-150, 150],
        step: 0.1,
      },
    },
  },
  // {
  //   name: 'MultiColorReplaceFilter',
  //   image: '/assets/effect-images/multi-color-replace.png',
  // },
  {
    name: 'NoiseFilter',
    image: '/assets/effect-images/noise.png',
    params: {
      noise: {
        value: 0.5,
        range: [0, 1],
        step: 0.01,
      },
      seed: {
        value: 0,
        range: [0.01, 0.99],
        step: 0.01,
      },
    },
  },
  // {
  //   name: 'OldFilmFilter',
  //   image: '/assets/effect-images/old-film.png',
  // },
  {
    name: 'OutlineFilter',
    image: '/assets/effect-images/outline.png',
    params: {
      thickness: {
        value: 5,
        range: [0, 10],
        step: 1,
      },
      color: {
        value: '#000000',
        type: 'color',
      },
      alpha: {
        value: 1,
        range: [0, 1],
        step: 0.01,
      },
      knockout: {
        value: false,
        type: 'boolean',
      },
    },
  },
  {
    name: 'PixelateFilter',
    image: '/assets/effect-images/pixelate.png',
    params: {
      size_x: {
        value: 10,
        range: [4, 40],
        step: 1,
      },
      size_y: {
        value: 10,
        range: [4, 40],
        step: 1,
      },
    },
  },
  // {
  //   name: 'RadialBlurFilter',
  //   image: '/assets/effect-images/radial-blur.png',
  // },
  // {
  //   name: 'ReflectionFilter',
  //   image: '/assets/effect-images/reflection.png',
  //   params: {
  //     animationg: {
  //       value: false,
  //       type: 'boolean',
  //     },
  //     mirror: {
  //       value: false,
  //       type: 'boolean',
  //     },
  //     boundary: {
  //       value: 0.5,
  //       range: [0, 1],
  //       step: 0.01,
  //     },
  //     amplitude_start: {
  //       value: 0.5,
  //       range: [0, 50],
  //       step: 0.01,
  //     },
  //     amplitude_end: {
  //       value: 0.5,
  //       range: [0, 50],
  //       step: 0.01,
  //     },
  //     waveLength_start: {
  //       value: 10,
  //       range: [10, 200],
  //       step: 0.1,
  //     },
  //     waveLength_end: {
  //       value: 10,
  //       range: [10, 200],
  //       step: 0.1,
  //     },
  //     alpha_start: {
  //       value: 0.5,
  //       range: [0, 1],
  //       step: 0.01,
  //     },
  //     alpha_end: {
  //       value: 1,
  //       range: [0, 1],
  //       step: 0.01,
  //     },
  //     time: {
  //       value: 10,
  //       range: [0, 20],
  //       step: 0.01,
  //     },
  //   },
  // },
  {
    name: 'RGBSplitFilter',
    image: '/assets/effect-images/rgb.png',
    params: {
      red_x: {
        value: 0,
        range: [-20, 20],
        step: 0.01,
      },
      red_y: {
        value: 0,
        range: [-20, 20],
        step: 0.01,
      },
      green_x: {
        value: 0,
        range: [-20, 20],
        step: 0.01,
      },
      green_y: {
        value: 0,
        range: [-20, 20],
        step: 0.01,
      },
      blue_x: {
        value: 0,
        range: [-20, 20],
        step: 0.01,
      },
      blue_y: {
        value: 0,
        range: [-20, 20],
        step: 0.01,
      },
    },
  },
  // {
  //   name: 'ShockwaveFilter',
  //   image: '/assets/effect-images/shockwave.png',
  // },
  // {
  //   name: 'SimpleLightmapFilter',
  //   image: '/assets/effect-images/simple-lightmap.png',
  // },
  // {
  //   name: 'SimplexNoiseFilter',
  //   image: '/assets/effect-images/simplex-noise.png',
  // },
  // {
  //   name: 'TiltShiftFilter',
  //   image: '/assets/effect-images/tilt-shift.png',
  // },
  // {
  //   name: 'TwistFilter',
  //   image: '/assets/effect-images/twist.png',
  //   params: {
  //     angle: {
  //       value: 0,
  //       range: [-10, 10],
  //       step: 0.1,
  //     },
  //     radius: {
  //       value: 0,
  //       range: [0, 2000],
  //       step: 0.1,
  //     },
  //     offset_x: {
  //       value: 0,
  //       range: [0, 2000],
  //       step: 1,
  //     },
  //     offset_y: {
  //       value: 0,
  //       range: [0, 2000],
  //       step: 1,
  //     },
  //   },
  // },
  // {
  //   name: 'ZoomBlurFilter',
  //   image: '/assets/effect-images/zoom-blur.png',
  //   params: {
  //     strength: {
  //       value: 0.5,
  //       range: [0.01, 0.5],
  //       step: 0.01,
  //     },
  //     center_x: {
  //       value: 0.5,
  //       range: [0, 2000],
  //       step: 1,
  //     },
  //     center_y: {
  //       value: 0.5,
  //       range: [0, 2000],
  //       step: 1,
  //     },
  //     innerRadius: {
  //       value: 0,
  //       range: [0, 2000],
  //       step: 1,
  //     },
  //     radius: {
  //       value: 0,
  //       range: [0, 2000],
  //       step: 1,
  //     },
  //   },
  // },
];
