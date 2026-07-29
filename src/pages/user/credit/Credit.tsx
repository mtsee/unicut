import { observer } from 'mobx-react';
import { Button, Empty, Input, Modal, Pagination, Select, Spin, Table, Tag, Toast } from '@douyinfe/semi-ui';
import { Refresh, VipOne } from '@icon-park/react';
import { useEffect, useRef, useState } from 'react';
import ContentUser from '@components/content-user';
import { userService } from '@server/user.service';
import { user } from '@stores/user';
import { pubsub, util } from '@utils/index';
import server from './server';
import styles from './styles.module.less';

const creditStatusMap = {
  0: { text: '无效', type: 'tertiary' },
  1: { text: '可用', type: 'success' },
  2: { text: '已用完', type: 'warning' },
  3: { text: '已过期', type: 'danger' },
};

const actionMap = {
  vip: '充值会员赠送',
  vip_month: '会员月度赠送',
  purchase: '购买积分',
  purchase_refund: '购买积分退款扣回',
  admin: '后台发放',
  reward: '奖励积分',
  consume: '用户消费',
  deduct: '后台扣减',
  expire: '积分过期',
};

const sourceMap = {
  vip: '充值会员赠送',
  vip_month: '会员月度赠送',
  daily: '每日赠送',
  reward: '奖励积分',
  purchase: '购买积分',
  purchase_refund: '购买积分退款',
  admin: '后台发放',
  consume: '消费扣减',
  deduct: '后台扣减',
  expire: '积分过期',
};

const sceneMap = {
  tts: '语音合成',
  auc: '音频转录字幕',
  video: '视频生成',
  image: '图片生成',
  cv: '视觉智能',
  openai: '大语言模型',
};

const formatTime = value => (value ? util.formatDate(value, 'YYYY-MM-DD HH:mm:ss') : '-');
const formatDate = value => (value ? util.formatDate(value, 'YYYY-MM-DD') : '永久');

function Credit() {
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orderFilters, setOrderFilters] = useState({ keyword: '', status: '', source_type: '' });
  const [logFilters, setLogFilters] = useState({ keyword: '', type: '', source_type: '' });
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);
  const orderPage = useRef({ page: 1, page_size: 10, total: 0 });
  const logPage = useRef({ page: 1, page_size: 10, total: 0 });

  const loadOrders = async (filters = orderFilters) => {
    setOrdersLoading(true);
    const [res, err] = await server.getUserCredits({ ...orderPage.current, ...filters });
    setOrdersLoading(false);
    if (err) {
      Toast.error(err);
      return;
    }
    orderPage.current.total = res?.total || 0;
    setOrders(res?.data || []);
  };

  const loadLogs = async (filters = logFilters) => {
    setLogsLoading(true);
    const { source_type, ...queryFilters } = filters;
    const [res, err] = await server.getCreditLogs({
      ...logPage.current,
      ...queryFilters,
      type: queryFilters.type || source_type || '',
    });
    setLogsLoading(false);
    if (err) {
      Toast.error(err);
      return;
    }
    logPage.current.total = res?.total || 0;
    setLogs(res?.data || []);
  };

  useEffect(() => {
    userService.getUserDetail();
    loadOrders();
  }, []);

  const openLogs = () => {
    setLogsVisible(true);
    logPage.current.page = 1;
    loadLogs();
  };

  const searchOrders = () => {
    orderPage.current.page = 1;
    loadOrders();
  };

  const resetOrders = () => {
    orderPage.current.page = 1;
    const filters = { keyword: '', status: '', source_type: '' };
    setOrderFilters(filters);
    loadOrders(filters);
  };

  const searchLogs = () => {
    logPage.current.page = 1;
    loadLogs();
  };

  const resetLogs = () => {
    logPage.current.page = 1;
    const filters = { keyword: '', type: '', source_type: '' };
    setLogFilters(filters);
    loadLogs(filters);
  };

  const refreshBalance = async () => {
    setBalanceLoading(true);
    const [, err] = await userService.getUserDetail();
    await loadOrders();
    setBalanceLoading(false);
    if (err) {
      Toast.error(err);
      return;
    }
    Toast.success('刷新成功');
  };

  const creditColumns = [
    { title: '记录ID', dataIndex: 'id', width: 100 },
    { title: '来源', dataIndex: 'source_type', width: 120, render: value => sourceMap[value] || value || '-' },
    {
      title: '入账积分',
      dataIndex: 'credits',
      width: 120,
      render: value => <span className={styles.amountPositive}>+{Number(value || 0)}</span>,
    },
    {
      title: '剩余积分',
      dataIndex: 'balance',
      width: 120,
      render: value => value ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: value => {
        const item = creditStatusMap[value] || { text: value || '-', type: 'tertiary' };
        return <Tag type={item.type}>{item.text}</Tag>;
      },
    },
    { title: '有效期', dataIndex: 'expire_at', width: 170, render: formatDate },
    { title: '来源对象', dataIndex: 'source_ref_id', width: 180, render: (value, record) => value || record.source_ref_type || '-' },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatTime },
  ];

  const logColumns = [
    { title: '时间', dataIndex: 'createdAt', width: 170, render: formatTime },
    { title: '类型', dataIndex: 'type', width: 140, render: value => actionMap[value] || value || '-' },
    { title: '来源', dataIndex: 'source_type', width: 140, render: (value, record) => sourceMap[value || record.type] || value || record.type || '-' },
    {
      title: '积分变动',
      dataIndex: 'credits',
      width: 110,
      render: value => {
        const num = Number(value || 0);
        return <span className={num >= 0 ? styles.amountPositive : styles.amountNegative}>{num > 0 ? `+${num}` : num}</span>;
      },
    },
    { title: '余额', dataIndex: 'balance', width: 100, render: value => value ?? '-' },
    {
      title: '场景',
      dataIndex: 'task_type',
      render: (value, record) => {
        const scene = value || record.scene || record.details?.scene || record.details?.source_type || record.model || '';
        return sceneMap[scene] || scene || '-';
      },
    },
  ];

  if (!user.info) {
    return null;
  }

  return (
    <ContentUser title="我的积分">
      <div className={styles.credit}>
        <div className={styles.balance}>
          <div className={styles.label}>当前积分余额</div>
          <div className={styles.value}>{user.info.credits || 0}</div>
          <div className={styles.balanceActions}>
            <Button icon={<Refresh theme="outline" size="16" />} loading={balanceLoading} onClick={refreshBalance}>
              刷新
            </Button>
            <Button type="primary" icon={<VipOne theme="outline" size="16" />} onClick={() => {
              pubsub.publish('showCreditRecharge');
            }}>
              充值积分
            </Button>
            <Button icon={<VipOne theme="outline" size="16" />} onClick={openLogs}>
              积分明细
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>积分记录</div>
          <div className={styles.filters}>
            <Input
              value={orderFilters.keyword}
              placeholder="记录ID / 来源对象"
              showClear
              onChange={keyword => setOrderFilters({ ...orderFilters, keyword })}
              onEnterPress={searchOrders}
            />
            <Select
              value={orderFilters.status}
              placeholder="记录状态"
              showClear
              onChange={status => setOrderFilters({ ...orderFilters, status: status as string })}
            >
              {Object.entries(creditStatusMap).map(([value, item]) => (
                <Select.Option key={value} value={value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={orderFilters.source_type}
              placeholder="积分来源"
              showClear
              onChange={source_type => setOrderFilters({ ...orderFilters, source_type: source_type as string })}
            >
              {Object.entries(sourceMap).map(([value, text]) => (
                <Select.Option key={value} value={value}>
                  {text}
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" onClick={searchOrders}>
              查询
            </Button>
            <Button onClick={resetOrders}>重置</Button>
          </div>
          <Table
            rowKey="id"
            columns={creditColumns}
            dataSource={orders}
            loading={ordersLoading}
            pagination={false}
            empty={<Empty description="暂无积分记录" />}
          />
          <div className={styles.pagination}>
            <Pagination
              currentPage={orderPage.current.page}
              pageSize={orderPage.current.page_size}
              total={orderPage.current.total}
              onPageChange={page => {
                orderPage.current.page = page;
                loadOrders();
              }}
            />
          </div>
        </div>

        <Modal title="积分明细" visible={logsVisible} footer={null} width={860} onCancel={() => setLogsVisible(false)}>
          <Spin spinning={logsLoading}>
            <div className={styles.filters}>
              <Input
                value={logFilters.keyword}
                placeholder="流水ID / 订单ID"
                showClear
                onChange={keyword => setLogFilters({ ...logFilters, keyword })}
                onEnterPress={searchLogs}
              />
              <Select
                value={logFilters.type}
                placeholder="变动类型"
                showClear
                onChange={type => setLogFilters({ ...logFilters, type: type as string })}
              >
                {Object.entries(actionMap).map(([value, text]) => (
                  <Select.Option key={value} value={value}>
                    {text}
                  </Select.Option>
                ))}
              </Select>
              <Select
                value={logFilters.source_type}
                placeholder="积分来源"
                showClear
                onChange={source_type => setLogFilters({ ...logFilters, source_type: source_type as string })}
              >
                {Object.entries(sourceMap).map(([value, text]) => (
                  <Select.Option key={value} value={value}>
                    {text}
                  </Select.Option>
                ))}
              </Select>
              <Button type="primary" onClick={searchLogs}>
                查询
              </Button>
              <Button onClick={resetLogs}>重置</Button>
            </div>
            <Table rowKey="id" columns={logColumns} dataSource={logs} pagination={false} empty={<Empty description="暂无积分明细" />} />
            <div className={styles.pagination}>
              <Pagination
                currentPage={logPage.current.page}
                pageSize={logPage.current.page_size}
                total={logPage.current.total}
                onPageChange={page => {
                  logPage.current.page = page;
                  loadLogs();
                }}
              />
            </div>
          </Spin>
        </Modal>
      </div>
    </ContentUser>
  );
}

export default observer(Credit);
