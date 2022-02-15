import React, { Component } from 'react';
import queryString from "query-string";
import { ProLayout, utils } from 'suid';
import { Button } from 'antd';
import ViewDetail from "./components/ViewDetail";
import { hasKonwn } from './service';

const { Content, Footer } = ProLayout;
const { eventBus } = utils;

class MsgDetail extends Component {

  constructor(props) {
    super(props);
    this.params = queryString.parse(window.location.href.split('?')[1]);
  }

  getViewDetailProps = () => {

    const { detailId: id , category: msgCategory, } = this.params;

    return {
      id,
      msgCategory,
      showHead: false,
    };
  }

  handleHasKnown = () => {
    const { detailId: msgId , category: msgCategory, } = this.params;
    hasKonwn({ msgId, category: msgCategory }).then(result => {
      const { success } = result;
      if (success) {
        eventBus.emit('messageCountChange');
        eventBus.emit('closeTab', [window.frameElement && window.frameElement.id]);
      }
    });
  }

  render() {
    const { detailId, category } = this.params;
    return (
      <ProLayout>
        <Content>
          { detailId && category ? <ViewDetail {...this.getViewDetailProps()} /> : <h3>参数不对，明细id和类型</h3>}
        </Content>
        <Footer align='end'>
          <Button style={{ margin: '0 8px'}} type="primary" onClick={this.handleHasKnown}>
            知道了
          </Button>
        </Footer>
      </ProLayout>
    );
  }
}

export default MsgDetail;
