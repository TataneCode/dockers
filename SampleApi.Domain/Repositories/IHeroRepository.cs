using SampleApi.Domain.Models;

namespace SampleApi.Domain.Repositories;

public interface IHeroRepository
{
    Task<IReadOnlyList<HeroModel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HeroModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<HeroModel> CreateAsync(HeroModel hero, CancellationToken cancellationToken = default);
    Task<HeroModel?> UpdateAsync(HeroModel hero, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
