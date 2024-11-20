import Yup from '~/utils/validate'

export const LoginSchema = Yup.object({
  email: Yup.string().trim().required('Account is required'),
  password: Yup.string().trim().required('Password is required').min(5, 'Password >= 5 charactor')
})

export type Login = Yup.InferType<typeof LoginSchema>
