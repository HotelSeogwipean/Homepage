﻿using Seogwipean.Data.Repositories.Interface;
using Microsoft.Extensions.Logging;
using Seogwipean.Data.Models;
using System.Linq;
using System;
using Seogwipean.Util;
using Seogwipean.Model.ResultModels;
using System.Collections.Generic;
using Seogwipean.Model.SurfViewModels;
using Seogwipean.Model.CouponViewModels;
using Microsoft.EntityFrameworkCore;


namespace Seogwipean.Data.Repositories
{
    public class CouponRepository : ICouponRepository
    {
        private readonly ILogger _logger;
        private readonly HotelSeogwipeanDbContextFactory _dbContextFactory;

        public CouponRepository(ILoggerFactory loggerFactory,
            HotelSeogwipeanDbContextFactory dbContextFactory)
        {
            this._logger = loggerFactory.CreateLogger<CouponRepository>();
            this._dbContextFactory = dbContextFactory;
        }

        public Coupon GetCoupon(long Id)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var result = db.Coupon.FirstOrDefault(cou => cou.CouponId == Id);
                    if (result == null)
                    {
                        return null;
                    }
                    return result;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return null;
                }
                return null;
            }
        }

        public CouponViewModel GetCouponModel(long Id)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _db = db.Coupon.FirstOrDefault(c => c.CouponId == Id);
                    if (_db == null)
                    {
                        return null;
                    }

                    var result = new CouponViewModel
                    {
                        CouponId = _db.CouponId,
                        Phone = _db.Phone,
                        CreateDate = _db.CreateDate,
                        ExpireDate = _db.ExpireDate,
                        Comment = _db.Comment,
                        Status = CodesName.Booking_Booked,
                        UseDate = _db.UseDate
                    };

                    return result;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return null;
                }
                return null;
            }
        }


        public LongResult<IList<Coupon>> GetCouponList(CouponViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _list = db.Coupon.AsNoTracking();
                    var phone = vm.Phone;
                    var createDate = vm.CreateDate;

                    if (vm != null)
                    {
                        if (!string.IsNullOrEmpty(phone))
                        {
                            _list = _list.Where(b => b.Phone == phone);
                        }
                        if (createDate.Year > 1)
                        {
                            _list = _list.Where(b => b.CreateDate >= createDate);
                        }
                        if (vm.Status > 0)
                        {
                            _list = _list.Where(b => b.Status == vm.Status);
                        }
                    }

                    return new LongResult<IList<Coupon>>
                    {
                        Result = Common.Success,
                        Data = _list.OrderBy(b => b.CreateDate).ToList()
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<IList<Coupon>>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<IList<Coupon>>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }
        
        public LongResult<CouponViewModel> CreateCoupon(CouponViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var toDay = DateTime.Now;
                    var expireDay = toDay.AddDays(7);
                    var _phone = vm.Phone;

                    if (vm == null)
                    {
                        return new LongResult<CouponViewModel>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }

                    if (string.IsNullOrWhiteSpace(_phone))
                    {
                        throw new SeogwipeanException("전화번호가 존재하지 않습니다.");
                    }

                    var newDB = new Coupon
                    {
                        Phone = vm.Phone,
                        CreateDate = toDay,
                        ExpireDate = expireDay,
                        Status = CodesName.Coupon_UnUsed
                    };
                    db.Coupon.Add(newDB);
                    db.SaveChanges();

                    _logger.LogError(toDay + " || 쿠폰 신규 추가, 휴대폰 번호 : " + _phone);
                    return new LongResult<CouponViewModel>
                    {
                        Result = Common.Success,
                        Data = new CouponViewModel
                        {
                            CouponId = vm.CouponId,
                            Phone = vm.Phone,
                            CreateDate = toDay,
                            ExpireDate = expireDay,
                            Status = CodesName.Coupon_UnUsed,
                        }
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<CouponViewModel>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<CouponViewModel>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        public LongResult<CouponViewModel> UseCoupon(long couponId)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _coupon = db.Coupon.FirstOrDefault(b => b.CouponId == couponId);
                    var _status = _coupon.Status;
                    var _today = DateTime.Now;

                    if(_today > _coupon.ExpireDate)
                    {
                        _coupon.Status = CodesName.Coupon_Expired;
                        db.Update(_coupon);
                        db.SaveChanges();

                        return new LongResult<CouponViewModel>
                        {
                            Result = Common.Fail,
                            Reason = "유효기간이 지난 쿠폰입니다."
                        };
                    }

                    if (_status != CodesName.Coupon_UnUsed)
                    {
                        return new LongResult<CouponViewModel>
                        {
                            Result = Common.Fail,
                            Reason = $" 쿠폰 상태 : {_status} // 미사용: 0, 사용: 1, 유효기간 지남: 9"
                        };
                    }

                    _coupon.Status = CodesName.Coupon_Used;
                    _coupon.UseDate = _today;

                    db.Update(_coupon);
                    var _result = db.SaveChanges();
                    return new LongResult<CouponViewModel>
                    {
                        Result = Common.Success,
                        Data = new CouponViewModel
                        {
                            CouponId = _coupon.CouponId,
                            CreateDate = _coupon.CreateDate,
                            ExpireDate = _coupon.ExpireDate,
                            Phone = _coupon.Phone,
                            Comment = _coupon.Comment,
                            Status = _coupon.Status,
                            UseDate = _today
                        }
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<CouponViewModel>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<CouponViewModel>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        /*
        public LongResult<SurfViewModel> UpdateSurf(SurfViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var surfId = vm.Id;
                    var userName = vm.UserName;
                    var email = vm.Email;
                    var phone = vm.Phone;
                    var startDate = vm.StartDate;
                    var startTime = vm.StartTime;
                    var request = vm.Request;
                    var headCount = vm.HeadCount;
                    var ageRange = vm.AgeRange;

                    var _booking = db.Surf.FirstOrDefault(b => b.Id == surfId);
                    if (!string.IsNullOrWhiteSpace(userName))
                    {
                        _booking.UserName = userName;
                    }
                    if (!string.IsNullOrWhiteSpace(email))
                    {
                        _booking.Email = email;
                    }
                    if (!string.IsNullOrWhiteSpace(phone))
                    {
                        _booking.Phone = phone;
                    }
                    if (startDate.Year > 1)
                    {
                        _booking.StartDate = startDate;
                    }
                    if (startTime > 0)
                    {
                        _booking.StartTime = startTime;
                    }
                    if (!string.IsNullOrWhiteSpace(request))
                    {
                        _booking.Request = request;
                    }
                    if (vm.Status > 0)
                    {
                        _booking.Status = vm.Status;
                    }
                    if (headCount > 0)
                    {
                        _booking.HeadCount = headCount;
                    }
                    db.Update(_booking);
                    var _result = db.SaveChanges();
                    return new LongResult<SurfViewModel>
                    {
                        Result = Common.Success,
                        Data = new SurfViewModel
                        {
                            UserName = userName,
                            HeadCount = headCount,
                            Email = email,
                            Request = request,
                            Phone = phone,
                            StartDate = startDate,
                            StartTime = startTime,
                            Status = CodesName.Booking_Booked,
                            AgeRange = ageRange
                        }
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<SurfViewModel>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<SurfViewModel>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }*/


    }

}