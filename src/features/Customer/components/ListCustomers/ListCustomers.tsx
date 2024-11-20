import { SearchOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Button as ButtonAnt, Image, Input, Modal, Popconfirm, Space, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import type { FilterConfirmProps } from 'antd/es/table/interface'
import { ColumnType } from 'antd/lib/table'
import { useRef, useState } from 'react'
import Highlighter from 'react-highlight-words'
import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components'
import Loading from '~/components/Loading/Loading'
import { cancelDelete } from '~/features/Toppings'
import { NotFound } from '~/pages'
import { useDeleteUserMutation, useGetAllUserByRoleQuery } from '~/store/services/Users'
import { setOpenDrawer } from '~/store/slices'
import { setUser } from '~/store/slices/User/user.slice'
import { useAppDispatch } from '~/store/store'
import { IUser, IUserDataType } from '~/types'
import { messageAlert } from '~/utils/messageAlert'
import { pause } from '~/utils/pause'

// type Props = {}
type DataIndex = keyof IUserDataType
export const ListCustomers = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteUser] = useDeleteUserMutation()
  const [options, setoptions] = useState({
    page: 1,
    limit: 10,
    roleName: 'customer' as 'customer' | 'staff'
  })

  /*Search */
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef<InputRef>(null)

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<IUserDataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          size='middle'
          ref={searchInput}
          placeholder={`Tìm kiếm`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <ButtonAnt
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Tìm kiếm
          </ButtonAnt>
          <ButtonAnt onClick={() => clearFilters && handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Làm mới
          </ButtonAnt>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
  })
  /*End Search */

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { data: customersData, isLoading, isError } = useGetAllUserByRoleQuery(options)

  const handleDeleteMany = () => {
    selectedRowKeys.forEach((selectItem) => {
      deleteUser(selectItem as string)
        .unwrap()
        .then(() => {
          messageAlert('Xóa thành công', 'success')
        })
        .catch(() => messageAlert('Xóa thất bại!', 'error'))
    })
    setSelectedRowKeys([])
  }
  const handleDelete = async (id: string) => {
    await pause(1000)
    deleteUser(id)
      .unwrap()
      .then(() => {
        messageAlert('Xóa thành công', 'success')
      })
      .catch(() => messageAlert('Xóa thất bại!', 'error'))
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }
  const hasSelected = selectedRowKeys.length > 1
  const columns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 50,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.index - b.index
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      ...getColumnSearchProps('fullName'),
      render: (name: string) => <span className='capitalize'>{name}</span>
    },
    {
      title: 'email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
      render: (email: string) => <span>{email}</span>
    },
    {
      title: 'Phân quyền',
      dataIndex: 'role',
      key: 'role',
      render: (phoneNumber: string) => <span>{phoneNumber}</span>
    },
    {
      title: 'SĐT',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phoneNumber: string) => <span>{phoneNumber}</span>
    },
    {
      title: 'Trạng thái xác minh',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified: string) => <span>{isVerified}</span>
    },
    {
      // title: <span className='block text-center'>Action</span>,
      key: 'action',
      width: 200,
      render: (_: any, customer: IUser) => (
        <div className='flex items-center justify-center'>
          <Space size='middle'>
            <Tooltip title='Cập nhật thông tin khách hàng này'>
              <ButtonAnt
                size='large'
                className='bg-primary hover:!text-white flex items-center justify-center text-white'
                icon={<BsFillPencilFill />}
                onClick={() => {
                  dispatch(setUser({ ...customer }))
                  dispatch(setOpenDrawer(true))
                }}
              />
            </Tooltip>
            <Tooltip title='Xóa người dùng này'>
              <Popconfirm
                title='Bạn có muốn xóa khách hàng này?'
                okButtonProps={{ style: { backgroundColor: '#3C50E0', color: '#fff' } }}
                onCancel={cancelDelete}
                onConfirm={() => handleDelete(customer._id!)}
              >
                <ButtonAnt
                  size='large'
                  className='bg-meta-1 hover:!text-white flex items-center justify-center text-white'
                  icon={<BsFillTrashFill />}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        </div>
      )
    }
  ]

  const customers = customersData?.data?.map((customer: any, index: number) => ({
    ...customer,
    key: customer._id,
    index: index + 1
  }))
  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }
  if (isLoading) return <Loading />
  if (isError) return <NotFound />
  return (
    <>
      {hasSelected && (
        <Space className='mb-4'>
          <Popconfirm
            title='Bạn thực sự muốn xóa những danh mục này?'
            description='Hành động này sẽ xóa những danh mục đang được chọn!'
            onConfirm={handleDeleteMany}
            onCancel={() => setSelectedRowKeys([])}
          >
            <Button variant='danger'>Xóa tất cả</Button>
          </Popconfirm>

          {/* <Button
          // size='large'
          icon={<HiDocumentDownload />}
          styleClass='bg-[#209E62] text-white text-sm font-semibold capitalize'
          onClick={() => {
            if (customers && customers.length === 0) {
              messageAlert('Không có dũ liệu để xuất', 'error')
            }
            exportDataToExcel(customers, 'Customer Data')
          }}
        >
          Xuất excel
        </Button> */}
        </Space>
      )}
      <Modal title='Basic Modal' open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-semibold'>Đăng Nhập Hoặc Tạo Tài Khoản</h2>
              <button className='text-gray-500'>&times;</button>
            </div>
            <div className='flex flex-col items-center'>
              <img src='https://placehold.co/100x100' alt='Phone with gift icon' className='mb-4' />
              <p className='text-center text-gray-700 mb-4'>
                Nhập số điện thoại mua hàng để hưởng đặc quyền riêng tại FPT Shop
              </p>
              <input
                type='text'
                placeholder='Nhập số điện thoại'
                className='border border-gray-300 rounded px-4 py-2 mb-4 w-full'
              />
              <button className='bg-red-600 text-white px-4 py-2 rounded w-full'>TIẾP TỤC</button>
            </div>
          </div>
        </div>
      </Modal>

      <div className='dark:bg-graydark'>
        <Table
          columns={columns}
          dataSource={customers}
          bordered
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '25'],
            total: customersData?.data?.totalPage,
            onChange(page, pageSize) {
              setoptions((prev) => ({ ...prev, page, limit: pageSize }))
            }
          }}
          scroll={{ y: '50vh', x: 1000 }}
          rowSelection={rowSelection}
        />
      </div>
    </>
  )
}
