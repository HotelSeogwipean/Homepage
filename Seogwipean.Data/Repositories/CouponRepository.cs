using Seogwipean.Data.Repositories.Interface;
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
using Seogwipean.Model.KakaoViewModels;

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

        public CouponViewModel GetCouponKakao(KakaoViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var newDb = from _cou in db.Coupon
                                join _coudb in db.CouponDb
                                    on _cou.Matchdb equals _coudb.Id
                                select new CouponViewModel
                                {
                                    CouponId = _cou.CouponId,
                                    Comment = _cou.Comment,
                                    CreateDate = _cou.CreateDate,
                                    ExpireDate = _cou.ExpireDate,
                                    UseDate = _cou.UseDate,
                                    KakaoId = _cou.KakaoId,
                                    Phone = _cou.Phone,
                                    Status = _cou.Status,
                                    Percentage = _coudb.Percentage,
                                    Type = _cou.Type
                                };
                    var result = new Coupon();
                    if (vm.Search == 0)
                    {
                        newDb = newDb.Where(n => n.KakaoId == vm.Id);
                    }else if(vm.Search == 1)
                    {
                        newDb = newDb.Where(n => n.Phone == vm.Phone_number);
                    }
                    return newDb.FirstOrDefault();
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
                        UseDate = _db.UseDate,
                        Type = _db.Type,
                        KakaoId= _db.KakaoId
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
                    var _kakaoId = vm.KakaoId;
                    var _type = vm.Type;

                    var _db = new Coupon();

                    if (vm == null)
                    {
                        return new LongResult<CouponViewModel>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }
                    if(vm.Search == 0)
                    {
                        _db = db.Coupon.FirstOrDefault(c => c.KakaoId == _kakaoId);
                    }
                    else
                    {
                        _db = db.Coupon.FirstOrDefault(c => c.Phone == _phone);
                    }
                    if (_db != null)
                    {
                        throw new SeogwipeanException("이미 생성된 쿠폰이 있습니다.");
                    }
                    var newDB = new Coupon
                    {
                        Phone = vm.Phone,
                        CreateDate = toDay,
                        ExpireDate = expireDay,
                        Status = CodesName.Coupon_UnUsed,
                        KakaoId = vm.KakaoId,
                        Matchdb = 1,
                        Type = _type 
                        // 서귀피안베이커리 10% 쿠폰(5) 더비치하우스(6)
                    };
                    db.Coupon.Add(newDB);
                    var result = db.SaveChanges();
                    _logger.LogError(toDay + " || 쿠폰 신규 추가, 휴대폰 번호 : " + _phone);
                    return new LongResult<CouponViewModel>
                    {
                        Result = Common.Success,
                        Data = new CouponViewModel
                        {
                            CouponId = result,
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

        public LongResult<CouponViewModel> UseCoupon(string phone)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _coupon = db.Coupon.FirstOrDefault(b => b.Phone == phone);
                    var _status = _coupon.Status;
                    var _today = DateTime.Now;

                    if(_today > _coupon.ExpireDate)
                    {
                        _coupon.UseDate = _today;
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
                            Reason = $" 쿠폰 상태 : {_status} // 미사용: 0, 사용: 1, 유효기간 지남: 9",
                            Data = new CouponViewModel { 
                                CouponId = _coupon.CouponId,
                                Comment = _coupon.Comment,
                                CreateDate = _coupon.CreateDate,
                                Status = _coupon.Status,
                                ExpireDate = _coupon.ExpireDate,
                                UseDate = _coupon.UseDate,
                                KakaoId = _coupon.KakaoId,
                                Phone = _coupon.Phone,
                                Type= _coupon.Type
                            }
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
                            UseDate = _today,
                            Type = _coupon.Type
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
        
        public CouponDb GetCouponDB(long Id)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _db = db.CouponDb.FirstOrDefault(c => c.Id == Id);
                    if (_db == null)
                    {
                        return null;
                    }
                    return _db;
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

        public CouponDb UpdateCouponDB(CouponDBViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _db = db.CouponDb.FirstOrDefault(c => c.Id == vm.Id);
                    if (_db == null)
                    {
                        return null;
                    }
                    if(vm.Percentage > 0)
                    {
                        _db.Percentage = vm.Percentage;
                    }
                    if (!string.IsNullOrWhiteSpace(vm.Memo))
                    {
                        _db.Memo = vm.Memo;
                    }
                    if (!string.IsNullOrWhiteSpace(vm.Writer))
                    {
                        _db.Writer = vm.Writer;
                    }
                    if(vm.UseDate > 0)
                    {
                        _db.StartDate = vm.StartDate;
                        _db.EndDate = vm.EndDate;
                    }
                    db.Update(_db);
                    db.SaveChanges();
                    return _db;
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

    }

}