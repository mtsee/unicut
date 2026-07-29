import styles from './align.module.less';
import Item from '../item';
import { Tooltip } from '@douyinfe/semi-ui';
import {
  AlignLeft,
  AlignHorizontally,
  AlignRight,
  AlignTop,
  AlignVertically,
  AlignBottom,
  DistributeHorizontalSpacing,
  DistributeVerticalSpacing,
} from '@icon-park/react';
import { observer } from 'mobx-react';
import type { ImageElement } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

function GroupAlign(props: IProps) {
  const { editor } = stores;
  const elements = editor.getGroupElementData() as ImageElement[];
  const { width, height } = editor.data;
  return (
    <Item title={language.val('option_align')}>
      <div className={styles.align}>
        <Tooltip content={language.val('option_align_left')}>
          <a
            onClick={() => {
              const minx = Math.min(...elements.map(d => d.style.x - d.style.width / 2));
              elements.forEach(elem => {
                elem.style.x = minx + elem.style.width / 2;
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <AlignLeft theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_center')}>
          <a
            onClick={() => {
              // 计算居中
              const miny = Math.min(...elements.map(d => d.style.y - d.style.height / 2));
              const maxy = Math.max(...elements.map(d => d.style.y + d.style.height / 2));
              const center = (maxy + miny) / 2;
              elements.forEach(elem => {
                elem.style.y = center;
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <AlignHorizontally theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_right')}>
          <a
            onClick={() => {
              const maxx = Math.max(...elements.map(d => d.style.x + d.style.width / 2));
              elements.forEach(elem => {
                elem.style.x = maxx - elem.style.width / 2;
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <AlignRight theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_top')}>
          <a
            onClick={() => {
              const miny = Math.min(...elements.map(d => d.style.y - d.style.height / 2));
              elements.forEach(elem => {
                elem.style.y = miny + elem.style.height / 2;
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <AlignTop theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_vertical')}>
          <a
            onClick={() => {
              const minx = Math.min(...elements.map(d => d.style.x - d.style.width / 2));
              const maxx = Math.max(...elements.map(d => d.style.x + d.style.width / 2));
              const center = (maxx + minx) / 2;
              elements.forEach(elem => {
                elem.style.x = center;
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <AlignVertically theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_bottom')}>
          <a
            onClick={() => {
              const maxy = Math.max(...elements.map(d => d.style.y + d.style.height / 2));
              elements.forEach(elem => {
                elem.style.y = maxy - elem.style.height / 2;
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <AlignBottom theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_horizontal_space')}>
          <a
            onClick={() => {
              // 计算出间距
              const minx = Math.min(...elements.map(d => d.style.x - d.style.width / 2));
              const maxx = Math.max(...elements.map(d => d.style.x + d.style.width / 2));
              const elementsSort = [...elements].sort((a, b) => {
                return a.style.x - b.style.x;
              });
              const totalWidth = elements.reduce((a, b) => {
                return a + b.style.width;
              }, 0);
              const space = (maxx - minx - totalWidth) / (elements.length - 1);
              let prevx = elementsSort[0].style.x + elementsSort[0].style.width / 2;
              elementsSort.forEach((elem, index) => {
                if (index !== 0) {
                  elem.style.x = prevx + space + elem.style.width / 2;
                  prevx = elem.style.x + elem.style.width / 2;
                }
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <DistributeHorizontalSpacing theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content={language.val('option_align_vertical_space')}>
          <a
            onClick={() => {
              // 计算出间距
              const miny = Math.min(...elements.map(d => d.style.y - d.style.height / 2));
              const maxy = Math.max(...elements.map(d => d.style.y + d.style.height / 2));
              const elementsSort = [...elements].sort((a, b) => {
                return a.style.y - b.style.y;
              });
              const totalHeight = elements.reduce((a, b) => {
                return a + b.style.height;
              }, 0);
              const space = (maxy - miny - totalHeight) / (elements.length - 1);
              let prevy = elementsSort[0].style.y + elementsSort[0].style.height / 2;
              elementsSort.forEach((elem, index) => {
                if (index !== 0) {
                  elem.style.y = prevy + space + elem.style.height / 2;
                  prevy = elem.style.y + elem.style.height / 2;
                }
              });
              editor.updateMovie();
              editor.updateOption();
            }}
          >
            <DistributeVerticalSpacing theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
      </div>
    </Item>
  );
}

export default observer(GroupAlign);
