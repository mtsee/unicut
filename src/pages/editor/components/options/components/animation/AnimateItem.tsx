import styles from './animateItem.module.less';
import type { Transform, AnimationType } from 'video-core-sdk';
import { Forbid } from '@icon-park/react';

export interface IProps {
  item: {
    id: string;
    name: string;
    ename: string;
    type: AnimationType;
    frames: {
      progress: number;
      width?: number;
      height?: number;
      alpha?: number;
      transform?: Transform;
    }[];
  };
}

export default function AnimateItem(props: IProps) {
  const item = props.item;
  let str = '';
  if (item.id === 'null') {
    return (
      <div>
        <Forbid theme="outline" size="35" fill="#ff3737" />
      </div>
    );
  } else {
    str = `
    @keyframes H5_${item.id} {
      ${item.frames
        .map(d => {
          const arr = [];
          if (d.width !== undefined) {
            arr.push(`width: ${d.width}px`);
          }
          if (d.height !== undefined) {
            arr.push(`height: ${d.height}px`);
          }
          if (d.alpha !== undefined) {
            arr.push(`opacity: ${d.alpha}`);
          }
          if (d.transform) {
            const trans = [];
            if (d.transform.scaleX !== undefined) {
              trans.push(`scaleX(${d.transform.scaleX})`);
            }
            if (d.transform.scaleY !== undefined) {
              trans.push(`scaleY(${d.transform.scaleY})`);
            }
            if (d.transform.translateX !== undefined) {
              trans.push(`translateX(${d.transform.translateX}px)`);
            }
            if (d.transform.translateY !== undefined) {
              trans.push(`translateY(${d.transform.translateY}px)`);
            }
            if (d.transform.rotation !== undefined) {
              trans.push(`rotate(${(d.transform.rotation * 180) / Math.PI}deg)`);
            }
            if (d.transform.skewX !== undefined) {
              trans.push(`skewX(${(d.transform.skewX * 180) / Math.PI}deg)`);
            }
            if (d.transform.skewY !== undefined) {
              trans.push(`skewY(${(d.transform.skewY * 180) / Math.PI}deg)`);
            }
            arr.push(`transform: ${trans.join(' ')}`);
          }

          return `${(d.progress * 100).toFixed(2)}% {${arr.join(';')}}`;
        })
        .join('\n')}
    }
    `;
  }
  return (
    <div
      className={styles.item}
      style={{ animationName: `H5_${item.id}`, backgroundImage: `url(/assets/editor-images/animation.png)` }}
    >
      <style dangerouslySetInnerHTML={{ __html: str }}></style>
    </div>
  );
}
