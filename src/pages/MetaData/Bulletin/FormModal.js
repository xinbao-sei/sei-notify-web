import React, { PureComponent, Fragment } from "react";
import {Button, Form, Input, Modal, Row, Radio} from "antd";
import { formatMessage, FormattedMessage } from "umi-plugin-react/locale";
import { DatePicker,Skeleton } from 'antd';
import {ScrollBar, ComboGrid, Attachment,message } from "suid";
import BraftEditor from 'braft-editor';
import moment from 'moment';
import { constants, } from '@/utils';
import { getBulletin, } from './service';
import styles from "./FormMoal.less";
// 引入编辑器样式
import 'braft-editor/dist/index.css'

const { PRIORITY_OPT, TARGETTYPE_OPT, NOTIFY_SERVER_PATH, BASE_URL } = constants;

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 18
  }
};

const buttonWrapper = { span: 20, offset: 4 };
@Form.create()
class FormModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPreview: false,
      targetType: TARGETTYPE_OPT[1].value,
      editData: null,
    };
  };

  componentDidMount() {
    const { notifyId, } = this.props;
    if (notifyId) {
      getBulletin(notifyId).then(result => {
        const { success, data, msg, } = result || {};
        if (success) {
          this.setState({
            editData: data,
            targetType: data.targetType
          })
        } else {
          message.error(msg);
        }
      }).catch(err => {
        message.error(err.message);
      });
    }
  }

  onFormSubmit = _ => {
    const { form, save, } = this.props;
    const { editData, } = this.state;

    form.validateFieldsAndScroll((err, formData) => {
      if (err) {
        return;
      }
      const [effectiveDate, invalidDate,] = formData.effectiveDateRange;
      delete formData.effectiveDateRange;
      let tempFiles = formData.Attachments;
      if (!tempFiles && this.attachmentRef) {
        tempFiles = this.attachmentRef.getAttachmentStatus().fileList;
      }
      let params = {
        category: 'SEI_BULLETIN',
        effectiveDate: effectiveDate.format('YYYY-MM-DD'),
        invalidDate: invalidDate.format('YYYY-MM-DD'),
        docIds: tempFiles ? tempFiles.map(attach => attach.id || attach.uid) : [],
      };
      params = Object.assign({},editData || {}, params, formData, { content: formData.content.toHTML()});
      save(params);
    });
  };

  handleChangeTarget = (e) => {
    const { form } = this.props;

    this.setState({
      targetType: e.target.value,
    }, () => {
      if (e.target.value === TARGETTYPE_OPT[0].value) {
        form.setFieldsValue({
          targetName: e.target.value,
          targetValue: e.target.value,
        });
      } else {
        form.setFieldsValue({
          targetName: '',
          targetValue: '',
        });
      }
    });
  }

  getComboTreeProps = () => {
    const { form, } = this.props;
    return {
      form,
      name: 'targetName',
      field: ['targetCode'],
      store: {
        url: `/sei-basic/organization/getUserAuthorizedTreeEntities`,
      },
      reader: {
        name: 'name',
        field: ['code'],
      },
      placeholder: '请选择发布机构',
    };
  }

  getComboGridProps = () => {
    const { form } = this.props;
    const columns = [{
      title: '群组类型',
      width: 80,
      dataIndex: 'groupCategoryRemark',
    }, {
      title: '群组代码',
      width: 80,
      dataIndex: 'code',
    }, {
      title: '群组名称',
      width: 80,
      dataIndex: 'name',
    }];
    return {
      form,
      columns,
      name: 'targetName',
      field: ['targetValue'],
      searchProperties: ['code', 'name'],
      store: {
        autoLoad: false,
        url: `${NOTIFY_SERVER_PATH}/group/findAllUnfrozen`,
      },
      rowKey: "id",
      reader: {
        name: 'name',
        field: ['id',],
      },
      placeholder: '请选择发布群组',
    };
  }

  render() {
    const { form, closeFormModal, saving, showModal, notifyId } = this.props;
    const { editData } = this.state;
    const { getFieldDecorator } = form;
    const { targetType, } = this.state;
    const title = notifyId
      ?  formatMessage({ id: "bulletin.editBulletin", defaultMessage: "修改通知内容" })
      :  formatMessage({ id: "bulletin.addBulletin", defaultMessage: "新建通知内容" });
    return (
      <Modal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        centered
        maskClosable={false}
        footer={null}
        title={title}
        wrapClassName={styles["order-box"]}
      >
        <ScrollBar>
          {notifyId && !editData ? (
            <Skeleton loading={!editData} active></Skeleton>
          ) : (
            <Row style={{ width: '60%', margin: '0 auto' }}>
                <Form {...formItemLayout} layout="horizontal">
                  <FormItem style={{ display: 'none'}}>
                    {getFieldDecorator("id", {
                      initialValue: editData && editData.id,
                    })(<Input />)}
                  </FormItem>
                  <FormItem style={{ display: 'none'}}>
                    {getFieldDecorator("contentId", {
                      initialValue: editData && editData.contentId,
                    })(<Input />)}
                  </FormItem>
                  <FormItem label={formatMessage({ id: "bulletin.subject", defaultMessage: "标题" })}>
                    {getFieldDecorator("subject", {
                      initialValue: editData ? editData.subject : "",
                      rules: [{
                        required: true,
                        message: "标题不能为空",
                      }]
                    })(<Input />)}
                  </FormItem>
                  {/* <FormItem style={{ display: 'none' }}>
                    {getFieldDecorator("targetType", {
                      initialValue: targetType,
                    })(
                      <Input />
                    )}
                  </FormItem> */}
                  <FormItem label={formatMessage({ id: "bulletin.targetType", defaultMessage: "发布类型" })}>
                    {getFieldDecorator("targetType", {
                      initialValue: targetType,
                      rules: [{
                        required: true,
                        message: formatMessage({ id: "bulletin.targetType.required", defaultMessage: "发布类型不能为空" })
                      }]
                    })(
                      <RadioGroup onChange={this.handleChangeTarget} options={TARGETTYPE_OPT} />
                    )}
                  </FormItem>
                  <FormItem style={{ display: 'none' }}>
                    {getFieldDecorator("targetValue", {
                      initialValue: editData ? editData.targetValue : "",
                    })(<Input />)}
                  </FormItem>
                  {targetType === TARGETTYPE_OPT[0].value ? (
                    <Fragment>
                      <FormItem style={{ display: 'none' }}>
                        {getFieldDecorator("targetName", {
                          initialValue: targetType,
                        })(<Input />)}
                      </FormItem>
                    </Fragment>
                  ) : (
                    <FormItem label="发布群组">
                      {getFieldDecorator("targetName", {
                        initialValue: editData ? editData.targetName : "",
                        rules: [{
                          required: true,
                          message: "发布群组不能为空"
                        }]
                      })(<ComboGrid {...this.getComboGridProps()}/>)}
                    </FormItem>
                  )}
                  <FormItem label={formatMessage({ id: "bulletin.priority", defaultMessage: "优先级" })}>
                    {getFieldDecorator("priority", {
                      initialValue: editData ? editData.priority : PRIORITY_OPT[2].value,
                      rules: [{
                        required: true,
                        message: formatMessage({ id: "bulletin.priority.required", defaultMessage: "优先级不能为空" })
                      }]
                    })(
                      <RadioGroup options={PRIORITY_OPT} />
                    )}
                  </FormItem>
                  <FormItem label={formatMessage({ id: "bulletin.effectiveDate", defaultMessage: "有效期间" })}>
                    {getFieldDecorator("effectiveDateRange", {
                      initialValue: editData ? [moment(editData.effectiveDate), moment(editData.invalidDate)] : null,
                      rules: [{
                        required: true,
                        message: formatMessage({ id: "bulletin.effectiveDate.required", defaultMessage: "有效期间不能为空" })
                      }]
                    })(<RangePicker style={{ width: '100%', }} />)}
                  </FormItem>
                  <FormItem label={formatMessage({ id: "bulletin.content", defaultMessage: "通告内容" })}>
                    {getFieldDecorator("content", {
                      validateTrigger: 'onBlur',
                      initialValue: editData ? BraftEditor.createEditorState(editData.content) : "",
                      rules: [{
                        required: true,
                        validator: (_, value, callback) => {
                          if (value.isEmpty()) {
                            callback(formatMessage({ id: "bulletin.content.required", defaultMessage: "通告内容不能为空！" }))
                          } else {
                            callback()
                          }
                        }
                      }]
                    })(<BraftEditor
                      contentStyle={{border:"1px solid #c4cfd5",height:"auto",minHeight:"50px"}}
                    />)}
                  </FormItem>
                  <FormItem label="附件">
                  {getFieldDecorator("Attachments", {
                    })(
                      <Attachment
                      onAttachmentRef={inst => this.attachmentRef = inst}
                      entityId = {editData && editData.contentId}
                      serviceHost={`${BASE_URL}/edm-service`}
                    >

                    </Attachment>
                    )}
                  </FormItem>
                  <FormItem wrapperCol={buttonWrapper} className="btn-submit">
                    <Button
                      type="primary"
                      loading={saving}
                      onClick={this.onFormSubmit}
                    >
                      <FormattedMessage id="global.ok" defaultMessage="确定" />
                    </Button>
                  </FormItem>
                </Form>
            </Row>
          )}
        </ScrollBar>
      </Modal>
    );
  }
}

export default FormModal;
