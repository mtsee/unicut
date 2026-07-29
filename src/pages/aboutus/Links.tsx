import { Row, Col } from '@douyinfe/semi-ui';
import React, { useEffect, useRef, useState } from 'react';
import styles from './links.module.less';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
// link-logo
import logo_1 from '@images/logo_1.png';
import logo_2 from '@images/logo_2.png';
import logo_3 from '@images/logo_3.png';
import logo_4 from '@images/logo_4.png';
import logo_5 from '@images/logo_5.png';
import logo_6 from '@images/logo_6.png';
import logo_7 from '@images/logo_7.png';
import logo_8 from '@images/logo_8.png';
import logo_9 from '@images/logo_9.png';
import logo_10 from '@images/logo_10.png';
import logo_11 from '@images/logo_11.png';
import logo_12 from '@images/logo_12.png';
import logo_13 from '@images/logo_13.png';
import logo_14 from '@images/logo_14.png';
import { useResizeDetector } from 'react-resize-detector';
export interface ILinksProps {}

export default function Links(props: ILinksProps) {
  const { width, ref } = useResizeDetector();
  return (
    <Row gutter={8}>
      <Col span={24}>
        <div ref={ref} className={styles.links} style={{ marginTop: 30 }}>
          <Swiper
            modules={[Autoplay]}
            key={width}
            autoplay={{ delay: 3000 }}
            loop={true}
            slidesPerView={window.innerWidth > 1200 ? 10 : 3}
            className={styles.reviewswiper}
          >
            {[
              logo_1,
              logo_2,
              logo_3,
              logo_4,
              logo_5,
              logo_6,
              logo_7,
              logo_8,
              logo_9,
              logo_10,
              logo_11,
              logo_12,
              logo_13,
              logo_14,
            ].map((d, i) => {
              return (
                <SwiperSlide key={i}>
                  <div className={styles.linkitem}>
                    <img src={d} alt="" />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </Col>
    </Row>
  );
}
