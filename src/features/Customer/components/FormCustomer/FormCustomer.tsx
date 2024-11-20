import { Drawer, Form, Image, Input, Select } from 'antd'
import { RootState, useAppDispatch } from '~/store/store'
import { useAddUserMutation, useUpLoadAvartaUserMutation, useUpdateUserMutation } from '~/store/services/Users'
import { useEffect, useState } from 'react'

import { Button } from '~/components'
import { LoadingOutlined } from '@ant-design/icons'
import { RcFile } from 'antd/lib/upload'
import UploadFile from '~/components/UploadFile'
import { messageAlert } from '~/utils/messageAlert'
import { setOpenDrawer } from '~/store/slices'
import toast from 'react-hot-toast'
import { useAppSelector } from '~/store/hooks'
import axios from 'axios'

type FormCustomerProps = {
  open: boolean
}

export const FormCustomer = ({ open }: FormCustomerProps) => {
  const { userData } = useAppSelector((state: RootState) => state.user)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()
  const [checkOtp, setCheckOtp] = useState(false)
  const [otpValue, setOtpValue] = useState<any>(null)
  const [emailValue, setEmailValue] = useState(null)

  const [addUser, { isLoading: isAdding }] = useAddUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const [uploadFile, { isLoading: isUploading }] = useUpLoadAvartaUserMutation()
  console.log(userData, 'userData')
  useEffect(() => {
    userData._id &&
      form.setFieldsValue({
        userName: userData.userName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName,
        cccd: userData.cccd
      })
  }, [userData, form])

  const onFinish = async (values: any) => {
    console.log(values, 'values')
    if (fileList.length <= 0 && !userData._id) {
      setEmailValue(values.email)
      addUser({
        userName: values.userName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        fullName: values.fullName,
        cccd: values.cccd,
        password: values.password
      })
        .unwrap()
        .then(() => {
          toast.success('Thêm khách hàng thành công')
          // onClose()
          setCheckOtp(true)
        })
        .catch((error: any) => {
          toast.error(`Thêm khách hàng thất bại! ${error.data.message}`)
          onClose()
        })
      return
    }
    // loyalCustomers: values.loyalCustomers == 'true' ? true : false,
    if (userData._id && fileList.length === 0) {
      updateUser({ ...values, _id: userData._id })
        .unwrap()
        .then(() => {
          messageAlert('Cập nhật thành công', 'success')
          onClose()
        })
        .catch(() => {
          messageAlert('Cập nhật thất bại', 'error')
        })
      return
    }
  }
  const onClose = () => {
    setFileList([])
    // userData._id && dispatch(setUser({ _id: '', username: '', gender: '', avatar: '' }))
    form.resetFields()
    dispatch(setOpenDrawer(false))
    setCheckOtp(false)
  }
  const handelSubmitOtp = async () => {
    try {
      //
      const dataPayload = {
        email: emailValue,
        otp: otpValue
      }
      const { data } = await axios.post(`${import.meta.env.VITE_API}/auth/verify-otp`, dataPayload)
      messageAlert('thành công', 'success')
      onClose()
    } catch (error) {
      //
    }
  }
  const handelSubmitOtpV2 = async () => {
    try {
      //
      const dataPayload = {
        email: emailValue
      }
      const { data } = await axios.post(`${import.meta.env.VITE_API}/auth/resend-otp`, dataPayload)
      messageAlert('Đã gửi lại Otp', 'success')
    } catch (error) {
      //
    }
  }
  return (
    <Drawer
      className='dark:!text-white dark:bg-black'
      title={userData._id ? 'Cập nhật thông tin khách hàng' : 'Thêm khách hàng mới'}
      size='large'
      destroyOnClose
      onClose={() => {
        onClose()
      }}
      getContainer={false}
      open={open}
    >
      <>
        {checkOtp ? (
          <>
            <div className='flex items-center justify-center min-h-screen bg-gray-100'>
              <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold'>Đăng Nhập Hoặc Tạo Tài Khoản</h2>
                  <button className='text-gray-500'>&times;</button>
                </div>
                <div className='flex flex-col items-center'>
                  <p className='text-center text-gray-700 mb-4'>Mã otp đã được gửi đến email của bạn , hãy nhập nó</p>
                  <input
                    type='text'
                    placeholder='Nhập mã otp'
                    onChange={(e) => setOtpValue(e.target.value)}
                    className='border border-gray-300 rounded px-4 py-2 mb-4 w-full'
                  />
                  <button onClick={handelSubmitOtp} className='bg-danger text-white px-4 py-2 rounded w-full mb-4'>
                    TIẾP TỤC
                  </button>
                  <button onClick={handelSubmitOtpV2} className='bg-danger text-white px-4 py-2 rounded w-full'>
                    Gửi lại
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
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
              label='UserName'
              name='userName'
              rules={[
                { required: true, message: 'Không được bỏ trống UserName!' },
                {
                  validator: (_, value, callback) => {
                    if (value && value.trim() === '') {
                      callback('Không được để trống')
                    }
                    if (value && /[^a-zA-Z0-9\s]/.test(value)) {
                      callback('UserName không được chứa ký tự đặc biệt!')
                    } else {
                      callback()
                    }
                  }
                }
              ]}
            >
              <Input size='large' placeholder='UserName' />
            </Form.Item>

            {/* {!userData._id && ( */}
            <Form.Item
              className='dark:text-white'
              label='email'
              name='email'
              rules={[
                { required: true, message: 'Không được bỏ trống tài khoản!' },
                { type: 'email', message: 'Email sai định dạng' }
              ]}
            >
              <Input type='email' size='large' placeholder='email' />
            </Form.Item>
            {/* )} */}
            <Form.Item
              className='dark:text-white'
              label='phoneNumber'
              name='phoneNumber'
              rules={[
                { required: true, message: 'Không được bỏ trống số điện thoại!' },
                {
                  validator: (_, value) => {
                    if (value && value.trim() === '') {
                      return Promise.reject('Không được để trống!')
                    }
                    if (value && !/^\d+$/.test(value)) {
                      return Promise.reject('Số điện thoại chỉ được chứa chữ số!')
                    }
                    if (value && value.length !== 10) {
                      return Promise.reject('Số điện thoại phải đúng 10 chữ số!')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input type='text' size='large' placeholder='phoneNumber' />
            </Form.Item>
            <Form.Item
              className='dark:text-white'
              label='fullName'
              name='fullName'
              rules={[
                { required: true, message: 'Không được bỏ trống họ và tên!' },
                {
                  validator: (_, value) => {
                    if (value && value.trim() === '') {
                      return Promise.reject('Không được để trống!')
                    }
                    if (value && /[^a-zA-Z\s]/.test(value)) {
                      return Promise.reject('Họ và tên chỉ được chứa chữ cái và khoảng trắng!')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input type='text' size='large' placeholder='fullName' />
            </Form.Item>
            <Form.Item
              className='dark:text-white'
              label='cccd'
              name='cccd'
              rules={[
                { required: true, message: 'Không được bỏ trống CCCD!' },
                {
                  validator: (_, value) => {
                    if (value && value.trim() === '') {
                      return Promise.reject('Không được để trống!')
                    }
                    if (value && !/^\d+$/.test(value)) {
                      return Promise.reject('CCCD chỉ được chứa chữ số!')
                    }
                    if (value && value.length !== 12) {
                      return Promise.reject('CCCD phải đúng 12 chữ số!')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input type='text' size='large' placeholder='cccd' />
            </Form.Item>
            {!userData._id && (
              <Form.Item
                className='dark:text-white'
                label='Mật khẩu'
                name='password'
                rules={[
                  { required: true, message: 'Không được bỏ trống mật khẩu!' },
                  {
                    min: 6,
                    message: 'Mật khẩu phải nhiều hơn 6 ký tự'
                  }
                ]}
              >
                <Input.Password placeholder='Mật khẩu' size='large' />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                disabled={isAdding || isUploading || isUpdating}
                styleClass='!w-full mt-5 py-2'
                type='submit'
                icon={(isAdding || isUploading || isUpdating) && <LoadingOutlined />}
              >
                {userData._id ? 'Cập nhật' : 'Thêm khách hàng'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </>
    </Drawer>
  )
}
