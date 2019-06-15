using Seogwipean.Model.CommunityViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface ICommunityService
    {
        LongResult<CommunityViewModel> AddWrite(CommunityViewModel vm);
        LongResult<IList<CommunityViewModel>> GetList(CommunityViewModel vm);
        LongResult UpdateViewCount(long boardId);
        LongResult<CommunityViewModel> GetBoard(long boardId);
        LongResult UpdateStatus(CommunityViewModel vm);
        LongResult<CommunityViewModel> CheckPassword(CommunityViewModel vm);
        LongResult AddComments(CommentsViewModel vm);
        LongResult<IList<CommentsViewModel>> GetCommentsList(long boardId);
    }
}