import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
import { Add, Reduce, AutoWidthOne } from '@icon-park/react';
import { Slider } from '@douyinfe/semi-ui';
import { debounce } from 'lodash';
import { stores } from '@stores/index';

type Props = {};

const SetScale = (props: Props) => {
  const { editor } = stores;
  const [rscale, setRScale] = useState(editor.rulerScale);

  const autoFun = useCallback(() => {
    // 计算合适的scale值
    const timelineWidth = document.getElementById('canvaTimelineRuler').clientWidth;
    const scale = Number(((timelineWidth - 200) / editor.movie.getTotalTime()).toFixed(2));
    editor.rulerScale = scale;
  }, []);

  // 缩小
  const zoomInFun = useCallback(() => {
    let scale = editor.rulerScale;
    scale = scale - scale / 5;
    if (scale < 1) {
      scale = 1;
    }
    editor.rulerScale = scale;
  }, []);

  // 放大
  const zoomOutFun = useCallback(() => {
    let scale = editor.rulerScale;
    scale = scale + scale / 5;
    if (scale > 500) {
      scale = 500;
    }
    editor.rulerScale = scale;
  }, []);

  const updateScale = useCallback(
    debounce(v => {
      editor.rulerScale = v;
    }, 300),
    [],
  );

  const size = 18;
  return (
    <>
      <section
        onClick={() => {
          autoFun();
        }}
      >
        <AutoWidthOne theme="outline" size={size} fill="var(--theme-icon)" />
      </section>
      <section
        onClick={() => {
          zoomInFun();
        }}
      >
        <Reduce theme="outline" size={size} fill="var(--theme-icon)" />
      </section>
      <section>
        <Slider
          style={{ width: 120 }}
          min={1}
          max={500}
          value={rscale}
          onChange={(v: number) => {
            setRScale(v);
            updateScale(v);
          }}
        />
      </section>
      <section
        onClick={() => {
          zoomOutFun();
        }}
      >
        <Add theme="outline" size={size} fill="var(--theme-icon)" />
      </section>
    </>
  );
};

export default observer(SetScale);
