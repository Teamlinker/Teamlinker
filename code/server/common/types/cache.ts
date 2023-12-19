class CacheRedisType<T>{
    public Number=0
    public String=""
    public Object:T=<T>{}
    public Boolean=true
    public Array:T=<T><unknown>[]
}
export function cacheRedisType<T=any>(){
    return new CacheRedisType<T>()
}