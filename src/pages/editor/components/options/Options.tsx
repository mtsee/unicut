import styles from './options.module.less';
// import OptionMenus from './Menus';
import { observer } from 'mobx-react';
import OptionsInner from './OptionsInner';
import { Background } from './components';
import { Empty } from '@douyinfe/semi-ui';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import { language } from '@language/language';
import { stores } from '@stores/index';
export interface IProps {}

function Options(props: IProps) {
  const { editor } = stores;
  editor.selectedElementIds;
  if (!editor.movie) return null;
  
  const elements = editor.movie.getElementDataByIds([...editor.selectedElementIds]) || [];
  if (editor.optionPanelCustom === 'background') {
    return (
      <div className={styles.optionbody}>
        <Background />
      </div>
    );
  }
  if (!editor.selectedElementIds.length) {
    return (
      <div className={styles.empty}>
        <Empty
          image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
          darkModeImage={<IllustrationNoContentDark style={{ width: 150, height: 150 }} />}
          // title="未选中任何元素"
          description={language.val('option_no_select')}
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.optionbody}>
        <OptionsInner elements={elements} />
      </div>
    </>
  );
}

export default observer(Options);
