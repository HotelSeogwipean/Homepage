using System;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.ResultModels;
using Seogwipean.Util;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Seogwipean.Data.Models;
using System.Collections.Generic;
using Seogwipean.Model.CommunityViewModels;

namespace Seogwipean.Data.Repositories
{
    public class CommunityRepository : ICommunityRepository
    {
        private readonly ILogger _logger;
        private readonly HotelSeogwipeanDbContextFactory _dbContextFactory;

        public CommunityRepository(ILoggerFactory loggerFactory,
            HotelSeogwipeanDbContextFactory dbContextFactory)
        {
            this._logger = loggerFactory.CreateLogger<CommunityRepository>();
            this._dbContextFactory = dbContextFactory;
        }

        #region #########################
        
        public LongResult<CommunityViewModel> AddWrite(CommunityViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    string userName = vm.UserName;
                    string password = Common.ToHashString(vm.Password);
                    string title = vm.Title;
                    string content = vm.Contents;
                    bool isLocked = vm.IsLocked;
                    string phone = vm.Phone;
                    short? _type = vm.Type;
                    short? roomType = vm.RoomType;
                    if (vm == null)
                    {
                        return new LongResult<CommunityViewModel>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }
                    if (string.IsNullOrWhiteSpace(userName))
                    {
                        throw new SeogwipeanException("예약자명이 존재하지 않습니다.");
                    }
                    if (string.IsNullOrWhiteSpace(password))
                    {
                        throw new SeogwipeanException("비밀번호가 존재하지 않습니다.");
                    }
                    if (string.IsNullOrWhiteSpace(title))
                    {
                        throw new SeogwipeanException("제목이 존재하지 않습니다.");
                    }
                    if (string.IsNullOrWhiteSpace(content))
                    {
                        throw new SeogwipeanException("내용이 존재하지 않습니다.");
                    }

                    var newWrite = new Community
                    {
                        UserName = userName,
                        Password = password,
                        Title = title,
                        Contents = content,
                        Phone = phone,
                        RoomType = roomType,
                        Type = _type,
                        IsLocked = isLocked,
                        CreateDate = DateTime.UtcNow,
                        ModifyDate = DateTime.UtcNow
                    };

                    db.Community.Add(newWrite);
                    db.SaveChanges();

                    _logger.LogError($"{DateTime.UtcNow}, 신규 게시글 작성, 작성자: {userName}, 제목: {title} ");
                    return new LongResult<CommunityViewModel>
                    {
                        Result = Common.Success,
                        Data = new CommunityViewModel
                        {
                            UserName = userName,
                            Phone = phone,
                            Title = title,
                            CreateDate = DateTime.UtcNow
                        }
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<CommunityViewModel>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<CommunityViewModel>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        public LongResult<IList<Community>> GetList(CommunityViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    string userName = vm.UserName;
                    string title = vm.Title;
                    string content = vm.Contents;
                    bool isLocked = vm.IsLocked;
                    string phone = vm.Phone;
                    short? _type = vm.Type;
                    short? roomType = vm.RoomType;
                    int pageNo = vm.PageNo;
                    int pageSize = vm.PageSize;

                    if (vm == null)
                    {
                        return new LongResult<IList<Community>>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }

                    var _community = db.Community.AsNoTracking();

                    if (!string.IsNullOrWhiteSpace(userName))
                    {
                        _community = _community.Where(c => c.UserName.Contains(userName));
                    }
                    if (!string.IsNullOrWhiteSpace(title))
                    {
                        _community = _community.Where(c => c.Title.Contains(title));
                    }
                    if (!string.IsNullOrWhiteSpace(content))
                    {
                        _community = _community.Where(c => c.Contents.Contains(title));
                    }

                    var result = _community.OrderByDescending(c => c.BoardId).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
                    return new LongResult<IList<Community>>
                    {
                        Result = Common.Success,
                        Data = result
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<IList<Community>>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<IList<Community>>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        #endregion

    }

}
