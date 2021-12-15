using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Util
{
    public static class CodesName
    {
        public static readonly short Booking_Booked = 0;
        public static readonly short Booking_AdminChecked = 1;
        public static readonly short Booking_CheckIn = 2;
        public static readonly short Booking_CheckOut = 3;
        public static readonly short Booking_Updated = 4;
        public static readonly short Booking_Canceled = 9;

        public static readonly short Write_Activated = 1;
        public static readonly short Write_Deleted = 2;
        public static readonly short Write_AdminDeleted = 9;

        public static readonly short Write_Lock_Private = 0;
        public static readonly short Write_Lock_Public = 1;


        public static readonly short Coupon_UnUsed = 0;
        public static readonly short Coupon_Used = 1;
        public static readonly short Coupon_Expired = 9;
    }
}