import { reactive,UnwrapRef,ref,Ref} from "vue"
import axios from "@/plugins/axios";
interface State {
  tableData: Array<any>;
  pagination: {
    current: Number;
    total: Number;
    pageSize:Number,
    onChange: Function;
  };
  queryParams?:any
}
export default function getTableFunc() {
  const stateData: UnwrapRef<State> = reactive({
    pagination: {
      current: 1,
      total: 0,
      pageSize:10,
      onChange:()=>{}
    },
    tableData: [],
    queryParams:{}
  });
  const url:Ref = ref('')
  let handleTableChange =(current:any)=> {
    stateData.pagination.current = current;
    initData()
  }
  let setUrl = (val:string)=>{
    url.value = val
    initData()
  }
  let initData = (page?:Number) => {
    if(page){
      stateData.pagination.current = page;
    }
    let params = {
      page: +stateData.pagination.current-1,
      size: stateData.pagination.pageSize,
    };
    params = Object.assign(params,stateData.queryParams)
    axios.get(url.value, { params: params }).then((res: any) => {
    stateData.tableData = res.data.data;
    stateData.pagination.onChange = handleTableChange;
    stateData.pagination.total = +res.data.count;
    });
  };
  let searchQuery = ()=>{
    initData(1)
  }
  let setParams = (projectId:any)=>{
    stateData.queryParams= {...stateData.queryParams,projectId}
  }
  return {
    stateData,
    handleTableChange,
    initData,
    setUrl,
    searchQuery,
    setParams,
    url
  }
}