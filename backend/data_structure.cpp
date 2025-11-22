#include <iostream>
#include <map>
#include <vector>
#include <string>
#include <algorithm>

class IntervalCalendar {
public:
    void addAvailable(int s,int e){
        if(s>=e)return;
        std::map<int,int>::iterator it=intervals.lower_bound(s);
        if(it!=intervals.begin()){
            std::map<int,int>::iterator prev=it;
            --prev;
            if(prev->second>=s)it=prev;
        }
        int newL=s;
        int newR=e;
        while(it!=intervals.end()&&it->first<=newR){
            newL=std::min(newL,it->first);
            newR=std::max(newR,it->second);
            std::map<int,int>::iterator toErase=it;
            ++it;
            intervals.erase(toErase);
        }
        intervals[newL]=newR;
    }

    bool isAvailable(int s,int e)const{
        if(s>=e)return false;
        std::map<int,int>::const_iterator it=intervals.upper_bound(s);
        if(it==intervals.begin())return false;
        --it;
        int L=it->first;
        int R=it->second;
        return(L<=s&&R>=e);
    }

    bool reserve(int s,int e){
        if(s>=e)return false;
        std::map<int,int>::iterator it=intervals.upper_bound(s);
        if(it==intervals.begin())return false;
        --it;
        int L=it->first;
        int R=it->second;
        if(L>s||R<e)return false;
        intervals.erase(it);
        if(L<s)intervals[L]=s;
        if(e<R)intervals[e]=R;
        return true;
    }

    void print()const{
        std::cout<<"Current available intervals:\n";
        std::map<int,int>::const_iterator it;
        for(it=intervals.begin();it!=intervals.end();++it){
            std::cout<<"["<<it->first<<", "<<it->second<<")\n";
        }
        std::cout<<"--------------\n";
    }

private:
    std::map<int,int> intervals;
};

class Renter {
public:
    std::string name;
    std::string phone;

    Renter(){}
    Renter(const std::string& n,const std::string& p):name(n),phone(p){}
};

class Option {
public:
    Renter renter;
    std::string location;
    double price;
    IntervalCalendar cal;

    Option():price(0.0){}
};

int main(){
    int n;
    std::cin>>n;
    std::vector<Option> options;
    options.resize(n);
    for(int i=0;i<n;++i){
        std::string name,phone,location;
        double price;
        int k;
        std::cin>>name>>phone>>location>>price>>k;
        options[i].renter=Renter(name,phone);
        options[i].location=location;
        options[i].price=price;
        for(int j=0;j<k;++j){
            int s,e;
            std::cin>>s>>e;
            options[i].cal.addAvailable(s,e);
        }
    }
    int m;
    std::cin>>m;
    for(int x=0;x<m;++x){
        int s,e;
        std::cin>>s>>e;
        bool matched=false;
        for(size_t i=0;i<options.size();++i){
            if(options[i].cal.isAvailable(s,e)){
                //options[i].cal.reserve(s,e);
                std::cout<<"Option found:\n";
                std::cout<<"  Renter name: "<<options[i].renter.name<<"\n";
                std::cout<<"  Renter phone: "<<options[i].renter.phone<<"\n";
                std::cout<<"  Location: "<<options[i].location<<"\n";
                std::cout<<"  Price: "<<options[i].price<<"\n";
                std::cout<<"  Reserved interval: ["<<s<<", "<<e<<")\n\n";
                matched=true;
            }
        }
        if(!matched)std::cout<<"false\n";
    }
    return 0;
}
