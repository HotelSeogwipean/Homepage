using System;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.ResultModels;
using Seogwipean.Util;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.BookingViewModels;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Seogwipean.Data.Models;
using System.Collections.Generic;

namespace Seogwipean.Data.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ILogger _logger;
        private readonly HotelSeogwipeanDbContextFactory _dbContextFactory;

        public BookingRepository(ILoggerFactory loggerFactory,
            HotelSeogwipeanDbContextFactory dbContextFactory)
        {
            this._logger = loggerFactory.CreateLogger<BookingRepository>();
            this._dbContextFactory = dbContextFactory;
        }

        #region #########################

        public LongResult DeleteBooking(long bookingId)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _booking = db.Booking.Where(b => b.BookingId == bookingId);
                    db.Remove(_booking);
                    var _result = db.SaveChanges();
                    return new LongResult
                    {
                        Result = _result
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        public LongResult<IList<Booking>> GetBookingList(BookingViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _list = db.Booking.AsNoTracking();
                    var isSearch = vm.IsSearch;
                    var userName = vm.UserName;
                    var startDate = vm.StartDate;
                    var endDate = vm.EndDate;
                    if(isSearch)
                    {
                        if (!string.IsNullOrEmpty(userName))
                        {
                            _list = _list.Where(b => b.UserName == userName);
                        }
                        if(startDate >= DateTime.Now || startDate.Date >= DateTime.Now.Date)
                        {
                            _list = _list.Where(b => b.StartDate >= startDate);
                        }
                        if (endDate >= DateTime.Now)
                        {
                            _list = _list.Where(b => b.EndDate <= endDate);
                        }
                    }
                    return new LongResult<IList<Booking>>
                    {
                        Result = Common.Success,
                        Data = _list.OrderBy(b => b.StartDate).OrderBy(b => b.EndDate).ToList()
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<IList<Booking>>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<IList<Booking>>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        public LongResult AddBooking(BookingViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    long bookingId = vm.BookingId;
                    string userName = vm.UserName;
                    string email = vm.Email;
                    string phone = vm.Phone;
                    string roomType = vm.RoomType;
                    string recommender = vm.Recommender;
                    int headCount = vm.HeadCount;
                    string request = vm.Request;
                    DateTime startDate = vm.StartDate;
                    DateTime? endDate = vm.EndDate;

                    if (vm == null)
                    {
                        return new LongResult<BookingViewModel>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }

                    if (string.IsNullOrWhiteSpace(userName))
                    {
                        throw new SeogwipeanException("예약자명이 존재하지 않습니다.");
                    }
                    if (headCount < 1)
                    {
                        throw new SeogwipeanException("인원수가 존재하지 않습니다.");
                    }

                    var newBooking = new Booking
                    {
                        UserName = userName,
                        HeadCount = headCount,
                        Email = email,
                        Request = request,
                        Phone = phone,
                        Recommender = recommender,
                        RoomType = roomType,
                        StartDate = startDate,
                        EndDate = endDate,
                        CreateDate = DateTime.UtcNow
                    };

                    db.Booking.Add(newBooking);
                    db.SaveChanges();
                    return new LongResult
                    {
                        Result = Common.Success
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        public LongResult<IList<BookingViewModel>> GetBooking(BookingViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    string userName = vm.UserName;
                    string phone = vm.Phone;

                    if (vm == null)
                    {
                        return new LongResult<IList<BookingViewModel>>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }

                    var _booking = from _b in db.Booking.AsNoTracking()
                                   select new BookingViewModel
                                   {
                                       BookingId = _b.BookingId,
                                       Phone = _b.Phone,
                                       CreateDate = _b.CreateDate,
                                       Email = _b.Email,
                                       EndDate = _b.EndDate,
                                       HeadCount = _b.HeadCount,
                                       Recommender = _b.Recommender,
                                       Request = _b.Request,
                                       RoomType = _b.RoomType,
                                       StartDate = _b.StartDate,
                                       UserName = _b.UserName
                                   };
                    var find = new List<BookingViewModel>();

                    if (!string.IsNullOrWhiteSpace(userName))
                    {
                        find = _booking.Where(_b => _b.UserName == userName || _b.UserName.Contains(userName)).ToList();
                    }
                    if (!string.IsNullOrWhiteSpace(phone))
                    {
                        find = _booking.Where(_b => _b.Phone == phone || _b.Phone.Contains(phone)).ToList();
                    }

                    if(find.Count() < 1)
                    {
                        throw new SeogwipeanException("존재하지 않는 예약자 정보 입니다.");
                    }

                    return new LongResult<IList<BookingViewModel>>
                    {
                        Result = Common.Success,
                        Data = find
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<IList<BookingViewModel>>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<IList<BookingViewModel>>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        #endregion

    }

}
