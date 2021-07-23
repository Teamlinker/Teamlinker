import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // TeamLinker 主题
  primaryColor: '#0052CC',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Teamlinker',
  pwa: false,
  logo: '/logo.png',
  iconfontUrl: '',
};

export default Settings;
