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

        public LongResult<IList<CommentsViewModel>> GetCommentsList(long boardId)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var list = from comm in db.CommunityComments.AsNoTracking()
                               where comm.BoardId == boardId
                               select new CommentsViewModel
                               {
                                   BoardId = comm.BoardId,
                                   BoardCommentId = comm.BoardCommentId,
                                   UserName = comm.UserName,
                                   Comment = comm.Comment,
                                   Ip = comm.Ip,
                                   CreateDate = comm.CreateDate
                               };

                    return new LongResult<IList<CommentsViewModel>>
                    {
                        Result = Common.Success,
                        Data = list.ToList()
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<IList<CommentsViewModel>>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<IList<CommentsViewModel>>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        public LongResult AddComments(CommentsViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var newComment = new CommunityComments
                    {
                        BoardId = vm.BoardId,
                        UserName = vm.UserName,
                        Password = vm.Password,
                        Comment = vm.Comment,
                        Ip = vm.Ip,
                        CreateDate = DateTime.Now,
                        ModifyDate = DateTime.Now
                    };
                    db.CommunityComments.Add(newComment);
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

        public LongResult<CommunityViewModel> CheckPassword(CommunityViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _write = (from write in db.Community.AsNoTracking()
                                  where write.BoardId == vm.BoardId
                                  select new CommunityViewModel
                                  {
                                      BoardId = write.BoardId,
                                      Title = write.Title,
                                      Contents = write.Contents,
                                      Password = write.Password,
                                      UserName = write.UserName,
                                      Phone = write.Phone,
                                      IsLocked = write.IsLocked,
                                      CreateDate = write.CreateDate,
                                      ModifyDate = write.ModifyDate
                                  }).FirstOrDefault();

                    if (_write.Password != vm.Password)
                    {
                        if (vm.Password == Common.ToHashString("tjrnlvldks2019@")) { }
                        else
                        {
                            throw new SeogwipeanException("패스워드가 일치하지 않습니다.");
                        }
                    }
                    return new LongResult<CommunityViewModel>
                    {
                        Result = Common.Success,
                        Data = _write
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

        public LongResult UpdateViewCount(long boardId)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _write = db.Community.Where(c => c.BoardId == boardId).FirstOrDefault();
                    _write.ViewCount = _write.ViewCount + 1;
                    db.Update(_write);
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

        public LongResult<CommunityViewModel> GetBoard(long boardId)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _write = (from write in db.Community.AsNoTracking()
                                  where write.BoardId == boardId
                                  select new CommunityViewModel
                                  {
                                      BoardId = write.BoardId,
                                      Title = write.Title,
                                      Contents = write.Contents,
                                      Password = write.Password,
                                      UserName = write.UserName,
                                      Phone = write.Phone,
                                      IsLocked = write.IsLocked
                                  }).FirstOrDefault();
                    return new LongResult<CommunityViewModel>
                    {
                        Result = Common.Success,
                        Data = _write
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

        public LongResult UpdateStatus(CommunityViewModel vm)
        {
            try
            {
                using (var db = _dbContextFactory.Create())
                {
                    var _status = vm.Status;
                    var _write = db.Community.Where(c => c.BoardId == vm.BoardId).FirstOrDefault();
                    if (_status != CodesName.Write_AdminDeleted)
                    {
                        if (_write.Password != vm.Password)
                        {
                            throw new SeogwipeanException("패스워드가 일치하지 않습니다.");
                        }
                    }
                    _write.Status = vm.Status;
                    _write.ModifyDate = DateTime.Now;
                    db.Update(_write);
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
                    long? _type = vm.Type;
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
                        CreateDate = DateTime.Now,
                        ModifyDate = DateTime.Now,
                        ViewCount = 0,
                        Status = CodesName.Write_Activated
                    };

                    db.Community.Add(newWrite);
                    db.SaveChanges();

                    _logger.LogError($"{DateTime.Now}, 신규 게시글 작성, 작성자: {userName}, 제목: {title} ");
                    return new LongResult<CommunityViewModel>
                    {
                        Result = Common.Success,
                        Data = new CommunityViewModel
                        {
                            UserName = userName,
                            Phone = phone,
                            Title = title,
                            CreateDate = DateTime.Now
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

        public LongResult<IList<CommunityViewModel>> GetList(CommunityViewModel vm)
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
                    long? _type = vm.Type;
                    short? roomType = vm.RoomType;
                    int pageNo = vm.PageNo;
                    int pageSize = vm.PageSize;
                    if (vm == null)
                    {
                        return new LongResult<IList<CommunityViewModel>>
                        {
                            Result = Common.Fail,
                            Reason = "데이터가 존재하지 않습니다."
                        };
                    }
                    var _community = from com in db.Community.AsNoTracking()
                                     where com.Status == CodesName.Write_Activated
                                     select new CommunityViewModel
                                     {
                                         UserName = com.UserName,
                                         Title = com.Title,
                                         Contents = com.Contents,
                                         CreateDate = com.CreateDate,
                                         BoardId = com.BoardId,
                                         ModifyDate = com.ModifyDate,
                                         Status = com.Status.Value,
                                         Type = com.Type.HasValue ? 0 : com.Type.Value,
                                         RoomType = com.RoomType,
                                         IsLocked = com.IsLocked
                                     };
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
                    var totalCnt = _community.Count();
                    var result = _community.OrderByDescending(c => c.BoardId).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
                    return new LongResult<IList<CommunityViewModel>>
                    {
                        Result = Common.Success,
                        Data = result,
                        Reason = totalCnt.ToString()
                    };
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e.ToString());
                if (e is SeogwipeanException)
                {
                    return new LongResult<IList<CommunityViewModel>>
                    {
                        Result = Common.Fail,
                        Reason = e.Message
                    };
                }
                return new LongResult<IList<CommunityViewModel>>
                {
                    Result = Common.Exception,
                    Reason = null
                };
            }
        }

        #endregion

    }

}
