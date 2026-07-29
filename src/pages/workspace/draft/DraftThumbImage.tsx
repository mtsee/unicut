import { useEffect, useState } from 'react';
import { Layers } from '@icon-park/react';
import { resolveLocalUrl } from '@utils/util';

interface IProps {
  thumb: string;
  width: number;
  height: number;
}

export default function DraftThumbImage({ thumb, width, height }: IProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (thumb) {
      resolveLocalUrl(thumb).then(setUrl);
    }
  }, [thumb]);

  if (!url) {
    return (
      <Layers theme="filled" style={{ opacity: 0.3 }} size="52" fill="var(--theme-icon)" strokeWidth={2} />
    );
  }

  return (
    <img
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        // width: (130 * width) / height,
        // height: 130,
      }}
      src={url}
      alt=""
    />
  );
}
