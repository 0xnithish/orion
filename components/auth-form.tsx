"use client"

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/use-auth-store'

interface Country {
  name: { common: string }
  cca2: string
  idd: { root: string; suffixes?: string[] }
  flags: { svg: string; png: string }
}

const loginSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name'),
  countryCode: z.string().min(1, 'Please select a country'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number')
})

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP')
})

type LoginFormValues = z.infer<typeof loginSchema>
type OtpFormValues = z.infer<typeof otpSchema>

export default function AuthForm() {
  const router = useRouter()
  const authData = useAuthStore((state) => state.authData)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const setAuthData = useAuthStore((state) => state.setAuthData)

  const [countries, setCountries] = useState<Country[]>([])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAuth, setPendingAuth] = useState<LoginFormValues | null>(null)
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; description: string }>(
    {
      isOpen: false,
      title: '',
      description: ''
    }
  )

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: '',
      countryCode: 'IN',
      phone: ''
    },
    mode: 'onChange'
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    },
    mode: 'onChange'
  })

  const selectedCountry = loginForm.watch('countryCode')

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    if (authData?.isAuthenticated) {
      router.push('/')
    }
  }, [authData, hasHydrated, router])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const targetCountries = ['IN', 'CN', 'GB', 'CA', 'AU', 'DE', 'FR']
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha?codes=${targetCountries.join(',')}&fields=name,cca2,idd,flags`
        )
        const data = await response.json()

        const sortedCountries = data.sort(
          (a: Country, b: Country) => targetCountries.indexOf(a.cca2) - targetCountries.indexOf(b.cca2)
        )

        setCountries(sortedCountries)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
        setCountries([
          { name: { common: 'India' }, cca2: 'IN', idd: { root: '+91' }, flags: { svg: '', png: '' } },
          { name: { common: 'China' }, cca2: 'CN', idd: { root: '+86' }, flags: { svg: '', png: '' } },
          { name: { common: 'United Kingdom' }, cca2: 'GB', idd: { root: '+44' }, flags: { svg: '', png: '' } },
          { name: { common: 'Canada' }, cca2: 'CA', idd: { root: '+1' }, flags: { svg: '', png: '' } },
          { name: { common: 'Australia' }, cca2: 'AU', idd: { root: '+61' }, flags: { svg: '', png: '' } },
          { name: { common: 'Germany' }, cca2: 'DE', idd: { root: '+49' }, flags: { svg: '', png: '' } },
          { name: { common: 'France' }, cca2: 'FR', idd: { root: '+33' }, flags: { svg: '', png: '' } }
        ])
      }
    }

    fetchCountries()
  }, [])

  const getCountryCode = (cca2: string) => {
    const country = countries.find((c) => c.cca2 === cca2)
    return country ? country.idd.root + (country.idd.suffixes?.[0] || '') : ''
  }

  const showAlert = (title: string, description: string) => {
    setAlertDialog({ isOpen: true, title, description })
  }

  const handleSendOtp = loginForm.handleSubmit((values) => {
    const sanitized: LoginFormValues = {
      ...values,
      name: values.name.trim()
    }

    setPendingAuth(sanitized)
    setIsLoading(true)

    const otpCode = '000000'

    setTimeout(() => {
      setIsLoading(false)
      setGeneratedOtp(otpCode)
      setIsOtpStep(true)
      otpForm.reset({ otp: '' })
      showAlert('OTP Alert!', `The Demo OTP is: ${otpCode}, please enter it to continue.`)
    }, 1000)
  })

  const handleVerifyOtp = otpForm.handleSubmit((values) => {
    if (!pendingAuth) {
      showAlert('Error', 'Please submit your details again.')
      setIsOtpStep(false)
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      if (values.otp === generatedOtp) {
        setAuthData({ ...pendingAuth, otp: generatedOtp, isAuthenticated: true })
        showAlert('Success', 'Login successful!')
        setPendingAuth(null)
        setTimeout(() => router.push('/'), 1200)
      } else {
        showAlert('Error', 'Invalid OTP. Please try again.')
      }
    }, 1000)
  })

  const handleChangeNumber = () => {
    setIsOtpStep(false)
    setGeneratedOtp('')
    const snapshot = pendingAuth ?? loginForm.getValues()
    loginForm.reset(snapshot)
    otpForm.reset({ otp: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center text-card-foreground">
          {isOtpStep ? 'Verify OTP' : 'Login / Signup'}
        </h1>

        {!isOtpStep ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                {...loginForm.register('name')}
              />
              {loginForm.formState.errors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {loginForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Phone Number
              </label>
              <div className="flex border border-border rounded-md focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                <Controller
                  name="countryCode"
                  control={loginForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-24 rounded-none border-none shadow-none focus:ring-0 focus:border-none cursor-pointer hover:bg-accent">
                        <SelectValue>
                          <div className="flex items-center gap-1">
                            {countries.find((c) => c.cca2 === field.value)?.flags.svg && (
                              <img
                                src={countries.find((c) => c.cca2 === field.value)?.flags.svg}
                                alt=""
                                className="w-4 h-3 object-cover"
                              />
                            )}
                            <span className="text-sm">{getCountryCode(field.value)}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.cca2} value={country.cca2}>
                            <div className="flex items-center gap-1 cursor-pointer">
                              {country.flags.svg && (
                                <img
                                  src={country.flags.svg}
                                  alt=""
                                  className="w-4 h-3 object-cover"
                                />
                              )}
                              <span className="text-sm">{getCountryCode(country.cca2)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <div className="border-l border-border"></div>
                <Controller
                  name="phone"
                  control={loginForm.control}
                  render={({ field }) => (
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="border-none shadow-none focus:ring-0 focus:border-none rounded-none flex-1 cursor-text"
                      maxLength={10}
                    />
                  )}
                />
              </div>
              {loginForm.formState.errors.phone && (
                <p className="mt-1 text-sm text-destructive">
                  {loginForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={isLoading || !loginForm.formState.isValid}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Enter the OTP sent to</p>
              <p className="font-semibold text-card-foreground">
                {getCountryCode(selectedCountry)} {pendingAuth?.phone ?? ''}
              </p>
            </div>

            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 6))}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            {otpForm.formState.errors.otp && (
              <p className="mt-1 text-sm text-center text-destructive">
                {otpForm.formState.errors.otp.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={isLoading || !otpForm.formState.isValid}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Button
              type="button"
              onClick={handleChangeNumber}
              className="w-full text-foreground hover:underline"
              variant="link"
              disabled={isLoading}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Change Number
            </Button>
          </form>
        )}
      </div>

      <AlertDialog open={alertDialog.isOpen} onOpenChange={(isOpen) => setAlertDialog({ ...alertDialog, isOpen })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })}>
              OK
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}