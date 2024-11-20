import { DatePicker, Drawer, message } from 'antd'
import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { FaAngleDown, FaTimes } from 'react-icons/fa'
import { createSearchParams, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '~/store/hooks'
import { useGetAllCategoryQuery, useGetAllProductsQuery } from '~/store/services'
import { RootState } from '~/store/store'
import { formatCurrency } from '~/utils'
import styles from './style.module.css'
import { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

const BookingEndUser = () => {
  const { id } = useParams()
  const [open, setOpen] = useState(false)
  const [showPopup, setIsShowPopup] = useState<boolean>(false)
  const [dateBooked, setDateBooked] = useState<any[]>([])
  const [checkedkindOfRoom, setCheckedkindOfRoom] = useState<{ name: string; price: number }[]>([])
  const [nameRadioInput, setNameRadioInput] = useState<{
    name: string
    price: number
    _id?: string
  }>()
  const showDrawer = () => {
    setOpen(true)
  }
  const [timeOn, setTimeOn] = useState<any[]>([])
  const [checkOnDate, setCheckOnDate] = useState(false)
  const togglePopup = useCallback(() => {
    setIsShowPopup(!showPopup)
    if (showPopup == false) {
      setCheckOnDate(false)
    }
  }, [showPopup])
  const [option, setOption] = useState<any>()
  const [searchParams] = useSearchParams()
  const idPro = searchParams.get('idPro')
  const onClose = () => {
    setOpen(false)
  }
  const {
    data: dataProducts,
    isLoading: loadingProduct,
    isError: errorProudct
  } = useGetAllProductsQuery({
    _page: 1,
    _limit: 10,
    query: ''
  })
  const navigate = useNavigate()
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>(dataProducts?.docs)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [price, setPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [totalToppingPrice, setTotalToppingPrice] = useState<number>(0)
  const [checkedToppings, setCheckedToppings] = useState<{ name: string; price: number; _id: string }[]>([])
  const [dateChecking, setDateChecking] = useState<any>({
    startDate: '',
    endDate: ''
  })
  const [bookedChairs, setBookedChairs] = useState([])
  const disabledDate = (current: moment.Moment) => {
    return current && current < moment().startOf('day')
  }
  const handleSearch = () => {
    const filtered = dataProducts?.docs?.filter((cate: any) => {
      const result = cate?.category?.name?.split('-')
      const start = result?.[0]?.toLowerCase() || ''
      const end = result?.[1]?.toLowerCase() || ''

      return (
        start.includes(startLocation.toLowerCase()) && end.includes(endLocation.toLowerCase())
        // Bạn có thể thêm điều kiện ngày đi ở đây nếu cần
      )
    })
    setFilteredRoutes(filtered)
  }
  useEffect(() => {
    if (idPro) {
      const handelFetchIdProduct = async () => {
        try {
          const { data } = await axios.get('http://localhost:8000/api/product/' + idPro)
          console.log(data, 'datadata')
          setOption(data?.data)
          setTimeOn(data?.timeGo)
        } catch (error) {
          //
        }
      }
      handelFetchIdProduct()
    }
  }, [idPro])
  useEffect(() => {
    if (dataProducts?.docs) {
      setFilteredRoutes(dataProducts?.docs)
    }
  }, [dataProducts?.docs])
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toppingPrice = Number(event.target.value)
    const toppingName = event.target.name
    const _idTopping = event.target.getAttribute('data-items') as string
    const data = { name: toppingName, price: toppingPrice, _id: _idTopping }
    const dataRoomBook = { name: toppingName, price: toppingPrice }
    if (event.target.checked) {
      setTotalToppingPrice((prev) => prev + toppingPrice)
      setPrice((prev) => prev + toppingPrice)
      setCheckedToppings((prev) => [...prev, data])
    } else {
      setTotalToppingPrice((prev) => prev - toppingPrice)
      setPrice((prev) => prev - toppingPrice)
      setCheckedToppings((prev) => {
        return prev.filter((topping) => topping.name !== toppingName)
      })
    }
  }
  // const getDisabledHours = (current: any) => {
  //   let disabledHoursArray: any[] = [
  //     0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  //   ]
  //   timeOn.forEach((booking: any) => {
  //     const bookingEndHour = parseInt(booking, 10)
  //     disabledHoursArray = disabledHoursArray.filter((t) => t != bookingEndHour)
  //   })
  //   console.log(disabledHoursArray, 'disabledHoursArray')
  //   return disabledHoursArray
  // }
  const getDisabledHours = (current: moment.Moment) => {
    let disabledHoursArray: number[] = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
    ]
    timeOn.forEach((booking: any) => {
      const bookingHour = parseInt(booking, 10)

      if (current && current.isSame(moment(), 'day')) {
        if (bookingHour >= moment().hour()) {
          disabledHoursArray = disabledHoursArray.filter((t) => t !== bookingHour)
        }
      } else {
        disabledHoursArray = disabledHoursArray.filter((t) => t !== bookingHour)
      }
    })
    console.log(disabledHoursArray, 'disabledHoursArray')
    return disabledHoursArray
  }
  const onDateChange: RangePickerProps['onChange'] = (date: dayjs.Dayjs | null, dateString: string) => {
    try {
      // Kiểm tra nếu người dùng chưa chọn ngày hoặc giờ
      if (!date) {
        console.warn('Ngày hoặc giờ chưa được chọn')
        return
      }
      const selectedDate = date.startOf('day') // Lấy ngày đã chọn (không có giờ)
      const selectedHour = date.hour() // Lấy giờ đã chọn từ đối tượng dayjs
      setDateChecking({
        startDate: dateString.split(' ')[0], // Lấy chuỗi ngày
        endDate: dateString.split(' ')[1] // Lấy chuỗi giờ
      })
      const filteredChairs = dateBooked
        .filter((booking: any) => {
          const bookingDate = dayjs(booking.startDate).startOf('day') // Ngày của booking
          const bookingHour = parseInt(booking?.endDate?.split(':')?.[0], 10) // Giờ của booking

          // So sánh ngày và giờ
          return selectedDate.isSame(bookingDate) && selectedHour === bookingHour
        })
        .map((booking: any) => booking.chair) // Lọc ghế đã được đặt

      setBookedChairs(filteredChairs) // Cập nhật ghế đã được đặt
      setCheckOnDate(true)
    } catch (error) {
      console.error('Lỗi khi xử lý chọn ngày và giờ:', error)
    }
  }
  const handleCheckboxChangeRoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newToppingPrice = Number(event.target.value)
    const selectedRoomId = event.target.dataset.items as any
    const toppingPrice = Number(event.target.value)
    const toppingName = event.target.name
    const dataRoomBook = { name: toppingName, price: toppingPrice }
    if (event.target.checked) {
      if (selectedRoom) {
        const oldToppingPrice = option.kindOfRoom.find((room: any) => room.name === selectedRoom)?.price || 0
        setPrice((pre) => pre - oldToppingPrice + newToppingPrice)
        setTotalToppingPrice((prev) => Number(prev) - toppingPrice)
        setCheckedkindOfRoom((prev) => prev.filter((topping) => topping.name !== toppingName))
      } else {
        setPrice((pre) => pre + newToppingPrice)
        setTotalToppingPrice((prev) => Number(prev) + toppingPrice)
        setCheckedkindOfRoom((prev) => [dataRoomBook])
      }
      setSelectedRoom(selectedRoomId)
    } else {
      setPrice((pre) => pre - newToppingPrice)
      setSelectedRoom(null)
    }
  }
  const handleAddToCart = async () => {
    const data = {
      name: option.name,
      size: nameRadioInput,
      toppings: checkedToppings,
      kindOfRoom: checkedkindOfRoom,
      quantity,
      image: option.images[0]?.url ?? '',
      price: (option.sale ? nameRadioInput && nameRadioInput?.price - option.sale : nameRadioInput?.price) as number,
      total: option.sale ? (price - option.sale) * quantity : price,
      product: option._id,
      sale: option?.sale ? option.sale : 0,
      startDate: dateChecking.startDate,
      endDate: dateChecking.endDate
    }
    try {
      const dataForm: any = {
        user: id as string,
        items: [
          {
            name: option.name,
            size: nameRadioInput,
            toppings: checkedToppings,
            kindOfRoom: checkedkindOfRoom,
            quantity: 1,
            image: option.images[0]?.url ?? '',
            price: (option.sale
              ? nameRadioInput && nameRadioInput?.price - option.sale
              : nameRadioInput?.price) as number,
            total: option.sale ? (price - option.sale) * quantity : price,
            product: option._id,
            sale: option?.sale ? option.sale : 0,
            startDate: dateChecking.startDate,
            endDate: dateChecking.endDate
          }
        ],
        total: (option.sale ? nameRadioInput && nameRadioInput?.price - option.sale : nameRadioInput?.price) as number,
        startDate: dateChecking.startDate,
        endDate: dateChecking.endDate,
        priceShipping: 0,
        noteOrder: ' ',
        moneyPromotion: {},
        paymentMethodId: 'cod',
        inforOrderShipping: {
          name: 'admin',
          email: 'admin@gmail.com',
          phone: '1',
          address: 'xxxxx',
          noteShipping: ''
        }
      }
      const result = await axios.post('http://localhost:8000/api/create-order', dataForm)
      console.log(result, 'resultresultresult')
      message.success('Order created successfully')
      setTimeout(() => {
        window.location.href = '/manager/orders'
      }, 2000)
    } catch (error) {
      //
    }

    console.log(data, 'datadata')
  }
  return (
    <div>
      <div
        className={`transition-opacity ease-in-out duration-[400ms] z-[11111111111111111111111111111111111111111111] ${
          showPopup ? 'opacity-1 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className='popup w-[90vw] h-[100vw] md:w-[750px] md:h-[600px] fixed top-[5%] left-[5vw] md:top-[calc(50%-500px)] lg:top-[calc(50%-250px)] md:left-[calc(50%-325px)] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] rounded-[3px] pt-[10px] pb-[10px] flex justify-center z-[5] bg-[#fbfbfb]'>
          <div
            onClick={() => {
              togglePopup()
              setCheckOnDate(false)
            }}
            className='close-btn absolute top-2 right-2 cursor-pointer z-[6]'
          >
            <FaTimes className='text-2xl font-[900] transition-all hover:scale-[1.2]' />
          </div>

          <div className='content w-full overflow-hidden'>
            <div className='flex flex-col h-full rounded-md'>
              <div className='info flex px-5 pb-3'>
                <div className='left flex-1 md:flex-none w-[150px] h-[150px] md:w-[180px] md:h-[180px]'>
                  <img
                    className='w-full h-full rounded-md max-w-[150px] max-h-[150px] md:max-w-[180px] md:max-h-[180px]'
                    src={option?.images[0]?.url}
                    alt='option image'
                  />
                </div>
                <div className='right md:flex-none flex-1 ml-4'>
                  <div className='title mr-4'>
                    <h4 className='line-clamp-2 text-lg font-semibold'>{option?.name}</h4>
                  </div>
                  <div className='price flex items-end mt-4'>
                    <span className='new-price pr-[10px] text-[#8a733f] font-semibold text-sm'>
                      {option?.sale > 0
                        ? formatCurrency(
                            option?.sale &&
                              // ? price * ((100 - option.sale) / 100) * quantity
                              (price - option?.sale) * quantity
                          )
                        : formatCurrency(price * quantity)}
                    </span>
                    {option?.sale ? (
                      <span className='old-price text-xs line-through'>{formatCurrency(price * quantity)}</span>
                    ) : (
                      ''
                    )}
                    {/* {option.sale ? <span className='old-price text-xs line-through'>{formatCurrency(price)}</span> : ''} */}
                  </div>
                  <div className='quantity md:items-center gap-y-2 md:flex-row flex flex-col items-start mt-5'>
                    <div className='change-quantity flex opacity-0'>
                      <div
                        onClick={() => (quantity === 1 ? setQuantity(1) : setQuantity((prev) => prev - 1))}
                        className='decrease text-white bg-[#799dd9] w-5 h-5 rounded-[50%] leading-[19px] text-[26px] font-semibold  text-center cursor-pointer select-none '
                      >
                        -
                      </div>
                      <div className='amount select-none px-[10px] text-sm'>{quantity}</div>
                      <div
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className='increase text-white bg-[#799dd9] w-5 h-5 rounded-[50%] leading-[20px] text-[26px] font-semibold  text-center cursor-pointer select-none'
                      >
                        +
                      </div>
                    </div>
                    <button className='cursor-auto btn-price bg-[#d8b979] text-white px-5 h-8 rounded-[32px] leading-[32px] md:ml-[30px] text-sm'>
                      +
                      {option?.sale > 0
                        ? formatCurrency(option?.sale && (price - option?.sale) * quantity)
                        : formatCurrency(price * quantity)}
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart()
                      }}
                      className='btn-price bg-[#d8b979] text-white px-5 h-8 rounded-[32px] leading-[32px] md:ml-[10px] text-sm'
                    >
                      Đặt
                    </button>
                  </div>
                  <div>
                    <span className='pt-2'>{option?.description}</span>
                  </div>
                </div>
              </div>
              <div className={`customize h-1/2 overflow-y-scroll p-5 grow mb-5 ${styles.popup_body}`}>
                {/* setCheckOnDate(true) */}
                {checkOnDate && (
                  <>
                    <div className='custom-size mb-2'>
                      <div className='title flex items-center justify-between px-5 mb-2'>
                        <div className='left text-base font-semibold'>Chọn ghế</div>
                        <div className='right'>
                          <FaAngleDown />
                        </div>
                      </div>
                      <div className='custom-content flex px-5 bg-white flex-wrap shadow-[0px_0px_12px_0px_rgba(0,0,0,.05)] rounded'>
                        {option &&
                          option.sizes &&
                          option.sizes.map((item: any) => {
                            return (
                              <label
                                onChange={() => {
                                  setPrice(Number(item.price) + Number(totalToppingPrice))
                                  setNameRadioInput(item)
                                }}
                                key={uuidv4()}
                                className={`${styles.container_radio} block w-full group`}
                              >
                                <span className='block'>Ghế {item.name}</span>
                                <input
                                  className='absolute opacity-0'
                                  defaultChecked={nameRadioInput?.name?.trim() == item?.name?.trim() ? true : false}
                                  type='radio'
                                  name='size'
                                  value={item.price}
                                  disabled={bookedChairs.includes(item?.name) ? true : false}
                                />
                                <span className={`${styles.checkmark_radio} group-hover:bg-[#ccc]`}></span>
                                <span
                                  className={`${!bookedChairs.includes(item?.name) ? 'text-black font-bold' : 'text-red-500 font-bold'}`}
                                >
                                  {bookedChairs.includes(item?.name) ? 'Hết ghế' : 'Còn trống'}
                                </span>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                    <div className='custom-topping'>
                      <div className='title flex items-center justify-between px-5 mb-2'>
                        <div className='left text-base font-semibold'>Chọn khung giờ</div>
                        <div className='right'>
                          <FaAngleDown />
                        </div>
                      </div>
                      <div className='custom-content flex px-5 bg-white flex-wrap shadow-[0px_0px_12px_0_rgba(0,0,0,.05)] rounded'>
                        {option &&
                          option.toppings.map((item: any) => {
                            console.log(item, 'itemitemitem')
                            return (
                              <div key={item._id} className='topping-wrap flex items-center justify-between w-full'>
                                <label className={`${styles.container_checkbox} group block w-full`}>
                                  <span className='text-sm capitalize'>{item.name}</span>
                                  <input
                                    onChange={(e) => handleCheckboxChange(e)}
                                    className='absolute w-0 h-0 opacity-0'
                                    type='checkbox'
                                    name={item.name}
                                    value={item.price}
                                    data-items={item._id}
                                    checked={
                                      checkedToppings.find((topping) => topping.name === item.name) ? true : false
                                    }
                                  />
                                  <span className={`${styles.checkmark_checkbox} group-hover:bg-[#ccc]`}></span>
                                </label>
                                <span className='topping-price text-sm'>{formatCurrency(item.price)}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </>
                )}
                <div className='custom-topping'>
                  <div className='title flex items-center justify-between px-5 mb-2'>
                    <div className='left text-base font-semibold'>Chọn loại Xe</div>
                    <div className='right'>
                      <FaAngleDown />
                    </div>
                  </div>
                  <div className='custom-content flex px-5 bg-white flex-wrap shadow-[0px_0px_12px_0_rgba(0,0,0,.05)] rounded'>
                    {option &&
                      option.kindOfRoom.map((item: any, index: number) => {
                        console.log(item, 'itemitem')
                        return (
                          <div key={index} className='topping-wrap flex items-center justify-between w-full'>
                            <label className={`${styles.container_checkbox} group block w-full`}>
                              <span className='text-sm capitalize'>{item.name}</span>
                              <input
                                onChange={(e) => handleCheckboxChangeRoom(e)}
                                className='absolute w-0 h-0 opacity-0'
                                type='checkbox'
                                name={item.name}
                                value={item.price}
                                data-items={item.name}
                                checked={selectedRoom === item.name} // Chỉ chọn phòng nào có id trùng với selectedRoom
                              />
                              <span className={`${styles.checkmark_checkbox} group-hover:bg-[#ccc]`}></span>
                            </label>

                            <span className='topping-price text-sm'>{formatCurrency(item.price)}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
                {/*  */}
                <div className='custom-topping  mt-4'>
                  <div className='left text-base font-semibold px-5 '>
                    <p>Thời gian đi</p>
                    {/* <DatePicker.RangePicker className='mt-2' onChange={onDateChange} disabledDate={disabledDate} /> */}
                    <DatePicker
                      className='mt-2'
                      onChange={onDateChange}
                      disabledDate={disabledDate}
                      disabledTime={(current) => {
                        return {
                          disabledHours: () => getDisabledHours(current)
                        }
                      }}
                      showTime={{ format: 'HH', minuteStep: 60 }}
                      format='YYYY-MM-DD HH:mm'
                    />
                  </div>
                </div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>
        <div onClick={togglePopup} className={`${styles.overlay}`}></div>
      </div>
      <div className='bg-white shadow-md rounded-lg p-6 flex items-center space-x-6 justify-center'>
        <div className='flex gap-10'>
          <div className='flex items-center space-x-2'>
            <i className='fas fa-map-marker-alt text-gray-500' />
            <div>
              <div className='text-gray-700 font-semibold'>Nơi đi</div>
              <input
                type='text'
                placeholder='Nhập nơi đi'
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className='border-b-2 border-danger text-gray-400 focus:outline-none'
              />
            </div>
          </div>
          <div className='border-l h-12' />
          <div className='flex items-center space-x-2'>
            <i className='fas fa-exchange-alt text-danger' />
            <div>
              <div className='text-gray-700 font-semibold'>Nơi đến</div>
              <input
                type='text'
                placeholder='Nhập nơi đến'
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className='border-b-2 border-danger text-gray-400 focus:outline-none'
              />
            </div>
          </div>
          <div className='border-l h-12' />
          <div className='flex items-center space-x-2'>
            <i className='fas fa-calendar-alt text-gray-500' />
            <div>
              <div className='text-gray-700 font-semibold'>Ngày đi</div>
              <input
                className='border-b-2 border-danger'
                type='date'
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>
          </div>
          <button
            className='bg-danger text-white font-semibold py-2 px-4 rounded-full flex items-center space-x-2'
            onClick={handleSearch}
          >
            <i className='fas fa-search' />
            <span>Tìm Chuyến</span>
          </button>
        </div>
      </div>

      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-6'>Lộ trình tham khảo</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Hiển thị kết quả tìm kiếm */}
          {filteredRoutes?.map((cate: any, index) => {
            console.log(cate.category, 'category')
            const result = cate?.category?.name?.split('-')
            const start = result?.[0]
            const end = result?.[1]

            return (
              <div key={index} className='bg-white rounded-lg shadow-md overflow-hidden'>
                <img
                  alt='Interior of a limousine with brown leather seats and a person standing'
                  className='w-full h-48 object-cover'
                  height={400}
                  src={cate?.images?.[0]?.url}
                  width={600}
                />
                <div className='p-4'>
                  <div className='flex items-center mb-2'>
                    <i className='fas fa-dot-circle text-danger mr-2'></i>
                    <span className='font-bold'>{start}</span>
                  </div>
                  <div className='flex items-center mb-2'>
                    <i className='fas fa-exchange-alt text-gray-500 mr-2'></i>
                  </div>
                  <div className='flex items-center mb-2'>
                    <i className='fas fa-dot-circle text-danger mr-2'></i>
                    <span className='font-bold'>{end}</span>
                  </div>
                  <div className='border-t border-dashed border-red-500 my-2 pt-2 font-bold'>{cate?.name}</div>
                  <div className='flex items-center mb-2'>
                    <span className='bg-gray-200 text-gray-800 text-sm font-medium px-2 py-1 rounded'>
                      Limousine {cate?.sizes?.length} chỗ
                    </span>
                    <span className='bg-red-100 text-danger text-sm font-medium px-2 py-1 rounded ml-2'>VIP</span>
                  </div>
                  <div className='flex justify-between'>
                    <button
                      onClick={() => {
                        navigate({
                          search: createSearchParams({
                            idPro: cate._id
                          }).toString()
                        })
                        togglePopup()
                        showDrawer()
                      }}
                      className='bg-danger text-white px-4 py-2 rounded'
                    >
                      Đặt
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BookingEndUser
