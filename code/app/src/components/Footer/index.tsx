import { useIntl } from 'umi';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
  });

  // TODO: 官网
  return (
    <DefaultFooter
      copyright={`${new Date().getFullYear()} ${defaultMessage}`}
      links={[
        {
          key: 'Teamlinker',
          title: 'Teamlinker',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
      ]}
    />
  );
};
