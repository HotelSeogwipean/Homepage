using Seogwipean.Model.ResultModels;
using Seogwipean.Model.SurfViewModels;
using System.Collections.Generic;

namespace Seogwipean.Data.Repositories.Interface
{
    public interface ISurfRepository
    {
        Models.Surf GetSurf(long Id);

        LongResult<IList<Models.Surf>> GetSurfList(SurfViewModel vm);

        LongResult<SurfViewModel> AddSurf(SurfViewModel vm);
        
        
    }
}
