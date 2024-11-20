import { LoadingOutlined } from '@ant-design/icons'
import { Checkbox, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Button } from '~/components'
import { useAppSelector } from '~/store/hooks'
import { useAddVoucherMutation, useUpdateVoucherMutation } from '~/store/services'
import { setOpenDrawer, setVoucher } from '~/store/slices'
import { RootState, useAppDispatch } from '~/store/store'
import { IVoucher } from '~/types'
import { messageAlert } from '~/utils/messageAlert'

interface VoucherAddProps {
  open: boolean
}

const VoucherAdd = ({ open }: VoucherAddProps) => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()
  const [addVoucher, { isLoading: isAdding }] = useAddVoucherMutation()
  const [updateVoucher] = useUpdateVoucherMutation()
  const { voucherData } = useAppSelector((state: RootState) => state.vouchers)
  const [checkedVoucher, setCheckedVoucher] = useState<boolean>()

  useEffect(() => {
    voucherData._id &&
      form.setFieldsValue({
        startDate: dayjs(voucherData.startDate),
        endDate: dayjs(voucherData.endDate),
        code: voucherData.code,
        sale: voucherData.sale,
        discount: voucherData.discount,
        discountAmount: voucherData.discountAmount,
        discountType: voucherData.discountType,
        title: voucherData.title,
        description: voucherData.description,
        isActive: voucherData.isActive
      })
  }, [form, voucherData])

  useEffect(() => {
    voucherData && voucherData._id && setCheckedVoucher(voucherData.isActive)
  }, [voucherData])

  const onFinish = async (values: IVoucher) => {
    if (voucherData._id) {
      updateVoucher({ _id: voucherData._id, ...values, isActive: checkedVoucher })
        .unwrap()
        .then(() => {
          messageAlert('Cập nhật thành công', 'success')
          onClose()
        })
        .catch(() => messageAlert('Cập nhật thất bại', 'error'))

      return
    }

    addVoucher(values)
      .unwrap()
      .then(() => {
        messageAlert('Thêm voucher thành công', 'success')
        onClose()
      })
      .catch(() => messageAlert('Thêm voucher thất bại!', 'error'))
  }
  const onClose = () => {
    dispatch(setOpenDrawer(false))
    dispatch(setVoucher({ _id: '', code: '', title: '', discount: 0, sale: 0 }))
    form.resetFields()
  }

  const checkTime = (current: dayjs.ConfigType, startValue: dayjs.ConfigType) => {
    const today = dayjs().startOf('day')

    // Disable dates before the start date
    if (startValue) {
      return current && (current < today || current < dayjs(startValue).startOf('day'))
    }

    return current && current < today
  }

  return (
    <Drawer
      title={voucherData._id ? 'Cập nhật voucher' : 'Thêm voucher mới'}
      width={476}
      destroyOnClose
      onClose={onClose}
      getContainer={false}
      open={open}
    >
      <Form
        name='basic'
        autoComplete='off'
        layout='vertical'
        form={form}
        className='dark:text-white'
        onFinish={onFinish}
      >
        <Form.Item
          className='dark:text-white'
          label='Mô tả'
          name='description'
          rules={[
            { required: true, message: 'Mô tả voucher không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value.trim() === '') {
                  return Promise.reject('Mô tả voucher không được chứa toàn khoảng trắng!')
                }

                return Promise.resolve()
              }
            }
          ]}
        >
          <Input size='large' placeholder='Mô tả voucher' />
        </Form.Item>
        <Form.Item
          className='dark:text-white'
          label='Mã code voucher'
          name='code'
          rules={[{ required: true, message: 'Mã Code voucher không được bỏ trống!' }]}
        >
          <Input size='large' placeholder='Tên voucher' />
        </Form.Item>
        <Form.Item
          className='dark:text-white'
          label='Số lượng giảm'
          name='discountAmount'
          rules={[
            { required: true, message: 'Không được bỏ trống!' },
            {
              validator: (_, value) => {
                if (value < 0) {
                  return Promise.reject('Số lượng không được âm!')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input size='large' placeholder='Số lượng giảm giá ' />
        </Form.Item>
        <Form.Item
          className='dark:text-white'
          label='Kiểu'
          name='discountType'
          rules={[{ required: true, message: 'Không được bỏ trống!' }]}
        >
          <Select placeholder='Kiểu' size='large'>
            <Select.Option value='AMOUNT'>
              <span className='text-sm capitalize'>AMOUNT</span>
            </Select.Option>
            <Select.Option value='PERCENT'>
              <span className='text-sm capitalize'>PERCENT</span>
            </Select.Option>
          </Select>
        </Form.Item>
        <Row justify='space-between'>
          <Col span={11}>
            <Form.Item
              className='dark:text-white'
              label='Ngày Bắt đầu'
              name='startDate'
              rules={[{ required: true, message: 'Không được bỏ trống!' }]}
            >
              <DatePicker
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                size='large'
                className='w-full'
              />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              className='dark:text-white'
              label='Ngày hết hạn'
              name='endDate'
              dependencies={['startDate']}
              rules={[
                { required: true, message: 'Không được bỏ trống!' },
                ({ getFieldValue }: any) => ({
                  validator(_, value) {
                    const result = checkTime(getFieldValue('startDate'), value)

                    if (result) {
                      return Promise.resolve()
                    } else {
                      return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu'))
                    }
                  }
                })
              ]}
            >
              <DatePicker
                size='large'
                className='w-full'
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            disabled={isAdding ? true : false}
            icon={isAdding && <LoadingOutlined />}
            styleClass='!w-full mt-5 py-2'
            type='submit'
          >
            {voucherData._id ? 'Cập nhật voucher' : 'Thêm voucher mới'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default VoucherAdd
