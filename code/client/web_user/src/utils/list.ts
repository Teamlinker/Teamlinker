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
}
export default function getTableFunc() {
  const stateData: UnwrapRef<State> = reactive({
    pagination: {
      current: 0,
      total: 0,
      pageSize:1,
      onChange:()=>{}
    },
    tableData: [],
  });
  const url:Ref = ref('')
  let handleTableChange =(current:any)=> {
    console.log(current,'current')
    stateData.pagination.current = current-1;
    initData()
  }
  let setUrl = (val:string)=>{
    url.value = val
    initData()
  }
  let initData = () => {
    console.log(url.value,'url.value')
    const params = {
      page: stateData.pagination.current,
      size: stateData.pagination.pageSize,
    };
    axios.get(url.value, { params: params }).then((res: any) => {
    stateData.tableData = res.data.data;
    stateData.pagination.onChange = handleTableChange;
    stateData.pagination.total = +res.data.count;
    });
  };
  let searchQuery = ()=>{
    
  }
  return {
    stateData,
    handleTableChange,
    initData,
    setUrl,
    searchQuery,
    url
  }
}