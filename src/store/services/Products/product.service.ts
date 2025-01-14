import { IProduct, IProductDocs } from '~/types'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const accessToken = localStorage.getItem('token');

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }
      return headers
    }
   }),
  tagTypes: ['Product'],

  endpoints: (builder) => ({
    /* get all products */
    getAllProducts: builder.query<IProductDocs, { _page?: number; _limit?: number; query?: string }>({
      query: ({ _page, _limit, query }) => `/buses`,
      providesTags: (result) => {
        return [{ type: 'Product', id: 'LIST' }]
      }
    }),
    getAllTrips: builder.query<IProductDocs, { _page?: number; _limit?: number; query?: string }>({
      query: ({ _page, _limit, query }) => `/trips`,
      providesTags: (result) => {
        return [{ type: 'Product', id: 'LIST' }]
      }
    }),
    getAllBusRoute: builder.query<IProductDocs, { _page?: number; _limit?: number; query?: string }>({
      query: ({ _page, _limit, query }) => `/bus-routes`,
      providesTags: (result) => {
        return [{ type: 'Product', id: 'LIST' }]
      }
    }),
    /* get one */
    getOneProduct: builder.query<{ message: string; data: IProduct }, { id: string }>({
      query: ({ id }) => `post/${id}`,
      providesTags: (_, __, _id) => [{ type: 'Product', _id }]
    }),

    /* lấy ra tất cả sản phẩm đã bị xóa mềm */
    geAllProductDeletedTrue: builder.query<IProductDocs, { _page?: number; _limit?: number; query?: string }>({
      query: ({ _page, _limit, query }) =>
        `/products/allDeleteTrueActiveTrue?_page=${_page}&_limit=${_limit}&query=${query}`,
      providesTags: (result) => {
        if (result) {
          const final = [
            ...result.docs.map(({ _id }) => ({ type: 'Product' as const, _id })),
            { type: 'Product' as const, id: 'LIST' }
          ]
          return final
        }
        return [{ type: 'Product', id: 'LIST' }]
      }
    }),

    /* lấy ra tất cả sản phẩm đã có is_delete false & is_active là true */
    getAllProductActive: builder.query<IProductDocs, { _page?: number; _limit?: number; query?: string }>({
      query: ({ _page, _limit, query }) => `/products?_page=${_page}&_limit=${_limit}&query=${query}`,
      providesTags: (result) => {
        if (result) {
          const final = [
            ...result.docs.map(({ _id }) => ({ type: 'Product' as const, _id })),
            { type: 'Product' as const, id: 'LIST' }
          ]
          return final
        }
        return [{ type: 'Product', id: 'LIST' }]
      }
    }),

    /* lấy ra tất cả sản phẩm is_delete false & is_active là false */
    getAllProductActiveFalse: builder.query<IProductDocs, { _page?: number; _limit?: number; query?: string }>({
      query: ({ _page, _limit, query }) => `/products/in-active?_page=${_page}&_limit=${_limit}&query=${query}`,
      providesTags: (result) => {
        if (result) {
          const final = [
            ...result.docs.map(({ _id }) => ({ type: 'Product' as const, _id })),
            { type: 'Product' as const, id: 'LIST' }
          ]
          return final
        }
        return [{ type: 'Product', id: 'LIST' }]
      }
    }),

    /* thêm sản phẩm */
    createProduct: builder.mutation<{ message: string; data: IProduct }, any>({
      query: (product) => ({
        url: '/buses',
        method: 'POST',
        body: product
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),
    createTrips: builder.mutation<{ message: string; data: IProduct }, any>({
      query: (product) => ({
        url: '/trips',
        method: 'POST',
        body: product
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),
    /* xóa mềm sản phẩm */
    deleteFakeProduct: builder.mutation<{ message: string; data: IProduct }, { id: string }>({
      query: ({ id }) => ({
        url: `/deleteFakeProduct/${id}`,
        method: 'PUT',
        body: {}
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),

    /* restore product */
    restoreProduct: builder.mutation<{ message: string; data: IProduct }, { id: string }>({
      query: ({ id }) => ({
        url: `/restoreProduct/${id}`,
        method: 'PUT',
        body: {}
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),

    /* xóa cứng sản phẩm */
    deleteProduct: builder.mutation<{ message: string; data: IProduct }, { id: string }>({
      query: ({ id }) => ({
        url: `/buses/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),
    deleteTrip: builder.mutation<{ message: string; data: IProduct }, { id: string }>({
      query: ({ id }) => ({
        url: `/trips/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),
    /* edit product */
    editProduct: builder.mutation<{ message: string; data: IProduct }, { id: string; product: IProduct }>({
      query: ({ id, product }) => {
        return {
          url: `/buses/${id}`,
          method: 'PUT',
          body: { ...product, _id: id }
        }
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),
    editTrips: builder.mutation<{ message: string; data: any }, { id: string; product: any }>({
      query: ({ id, product }) => {
        return {
          url: `/trips/${id}`,
          method: 'PUT',
          body: { ...product, _id: id }
        }
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    })
  })
})

export const {
  useGetAllProductsQuery,
  useGetOneProductQuery,
  useGeAllProductDeletedTrueQuery,
  useGetAllProductActiveQuery,
  useGetAllProductActiveFalseQuery,
  useCreateProductMutation,
  useDeleteFakeProductMutation,
  useRestoreProductMutation,
  useDeleteProductMutation,
  useEditProductMutation,
  useGetAllTripsQuery,
  useDeleteTripMutation,
  useGetAllBusRouteQuery,
  useCreateTripsMutation,
  useEditTripsMutation
} = productApi
