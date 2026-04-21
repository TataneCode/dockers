using SampleApi.Models;

namespace SampleApi.Services;

public abstract class EntityService<TModel, TRequest, TResponse>(JsonRepository<TModel> repository)
    : IEntityService<TRequest, TResponse>
    where TModel : class, IEntity
{
    protected abstract TResponse ToResponse(TModel model);
    protected abstract TModel ToModel(TRequest request);
    protected abstract void Apply(TRequest request, TModel model);

    public async Task<List<TResponse>> GetAllAsync() =>
        (await repository.ReadAllAsync()).Select(ToResponse).ToList();

    public async Task<TResponse?> GetByIdAsync(string id)
    {
        var entity = (await repository.ReadAllAsync()).FirstOrDefault(x => x.Id == id);
        return entity is null ? default : ToResponse(entity);
    }

    public async Task<TResponse> CreateAsync(TRequest request)
    {
        var all = await repository.ReadAllAsync();
        var model = ToModel(request);
        all.Add(model);
        await repository.SaveAllAsync(all);
        return ToResponse(model);
    }

    public async Task<TResponse?> UpdateAsync(string id, TRequest request)
    {
        var all = await repository.ReadAllAsync();
        var existing = all.FirstOrDefault(x => x.Id == id);
        if (existing is null) return default;
        Apply(request, existing);
        await repository.SaveAllAsync(all);
        return ToResponse(existing);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var all = await repository.ReadAllAsync();
        var removed = all.RemoveAll(x => x.Id == id);
        if (removed == 0) return false;
        await repository.SaveAllAsync(all);
        return true;
    }
}
