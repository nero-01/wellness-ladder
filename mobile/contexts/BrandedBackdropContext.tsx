import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  getBrandedBackdropUri,
  setBrandedBackdropUri as persistBrandedBackdropUri,
} from "@/lib/onboarding-storage"

type BrandedBackdropContextType = {
  imageUri: string | null
  setBrandedImageUri: (uri: string | null) => Promise<void>
}

const BrandedBackdropContext = createContext<
  BrandedBackdropContextType | undefined
>(undefined)

export function BrandedBackdropProvider({ children }: { children: ReactNode }) {
  const [imageUri, setImageUri] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const stored = await getBrandedBackdropUri()
      if (stored) setImageUri(stored)
    })()
  }, [])

  const setBrandedImageUri = useCallback(async (uri: string | null) => {
    setImageUri(uri)
    await persistBrandedBackdropUri(uri)
  }, [])

  const value = useMemo(
    () => ({ imageUri, setBrandedImageUri }),
    [imageUri, setBrandedImageUri],
  )

  return (
    <BrandedBackdropContext.Provider value={value}>
      {children}
    </BrandedBackdropContext.Provider>
  )
}

export function useBrandedBackdrop() {
  const ctx = useContext(BrandedBackdropContext)
  if (!ctx) {
    throw new Error("useBrandedBackdrop must be used within BrandedBackdropProvider")
  }
  return ctx
}
