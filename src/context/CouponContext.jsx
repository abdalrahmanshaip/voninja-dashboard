import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import PropTypes from 'prop-types'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'

const CouponContext = createContext()

export const useCoupon = () => useContext(CouponContext)

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const snapshot = await getDocs(collection(db, 'coupons'))
    setCoupons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  }

  const addCoupon = async (coupon) => {
    const newDocRef = doc(collection(db, 'coupons'))

    const couponWithId = {
      ...coupon,
      id: newDocRef.id,
    }

    await setDoc(newDocRef, couponWithId)

    fetchCoupons()
  }

  const updateCoupon = async (id, updated) => {
    await updateDoc(doc(db, 'coupons', id), updated)
    fetchCoupons()
  }

  const deleteCoupon = async (id) => {
    await deleteDoc(doc(db, 'coupons', id))
    fetchCoupons()
  }

  const value = {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
  }

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  )
}

CouponProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default CouponContext
