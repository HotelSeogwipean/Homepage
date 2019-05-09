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

        public LongResult<IList<Booking>> GetBookingList()
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _list = db.Booking.AsNoTracking().ToList();
                    return new LongResult<IList<Booking>>
                    {
                        Result = Common.Success,
                        Data = _list
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

        public LongResult<BookingViewModel> GetBooking(BookingViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    long bookingId = vm.BookingId;
                    string userName = vm.UserName;
                    int headCount = vm.HeadCount;
                    string request = vm.Request;
                    DateTime startDate = vm.StartDate;
                    DateTime? endDate = vm.EndDate;
                    DateTime? createDate = vm.CreateDate;
                    if(vm == null)
                    {
                        return new LongResult<BookingViewModel>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }
                    
                    if (!string.IsNullOrWhiteSpace(userName))
                    {
                        throw new SeogwipeanException("예약자명이 존재하지 않습니다.");
                    }

                    var booking = db.Booking.FirstOrDefault(b => b.UserName.Contains(userName));
                    if(booking == null)
                    {
                        throw new SeogwipeanException("존재하지 않는 예약자 정보 입니다.");
                    }

                    return new LongResult<BookingViewModel>
                    {
                        Result = Common.Success,
                        Data = new BookingViewModel
                        {
                            BookingId = booking.BookingId,
                            UserName = booking.UserName,
                            HeadCount = booking.HeadCount,
                            Request = booking.Request,
                            StartDate = booking.StartDate,
                            EndDate = booking.EndDate,
                            CreateDate = booking.CreateDate
                        }
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<BookingViewModel>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<BookingViewModel>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        #endregion

    }

}
