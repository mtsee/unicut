import $ from 'jquery';
import type { SourceItem } from '../../types';
import { Editor } from '@stores/editor';

export type EventsName = 'dragstart' | 'dragmove' | 'dragend';

export interface Point {
  x: number;
  y: number;
}

/**
 * 拖动元素到轨道上
 */
export class DragItemCls {
  // 事件
  public events: Record<EventsName, (item: SourceItem, pos: Point, event: any) => void> = {
    dragstart: function (item: SourceItem, pos: Point, event: any): void {
      throw new Error('dragstart Function not implemented.');
    },
    dragmove: function (item: SourceItem, pos: Point, event: any): void {
      throw new Error('dragmove Function not implemented.');
    },
    dragend: function (item: SourceItem, pos: Point, event: any): void {
      throw new Error('dragend Function not implemented.');
    },
  };

  // 绑定事件
  public on(name: EventsName, fn: (item: SourceItem, pos: Point, event: any) => void) {
    this.events[name] = fn;
  }

  constructor(editor: Editor) {
    this._init(editor);
  }

  private _init(editor: Editor) {
    const self = this;
    $(document)
      .off('mousedown.ievent.dragitem')
      .on('mousedown.ievent.dragitem', '[data-dragitem]', function (e) {
        // 点击按钮
        if ($(e.target).closest('a')[0]) {
          return;
        }
        const [id, type] = $(this).attr('data-dragitem').split('#');
        const item = editor.getFromActiveItems(id);
        if (!item) {
          console.error('数据异常', id, this);
          return;
        }
        self.events.dragstart(item, { x: e.pageX, y: e.pageY }, e);
        $(document)
          .on('mousemove.ievent.dragitem', em => {
            self.events.dragmove(item, { x: em.pageX, y: em.pageY }, em);
          })
          .on('mouseup.ievent.dragitem', eu => {
            self.events.dragend(item, { x: eu.pageX, y: eu.pageY }, eu);
            $(document).off('mousemove.ievent.dragitem');
            $(document).off('mouseup.ievent.dragitem');
          });
      });
  }

  public destroy() {
    $(document).off('mousedown.ievent.dragitem');
  }
}
