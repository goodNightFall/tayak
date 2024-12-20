#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include <vector>
#include <set>
using namespace std;

map<pair<string, char>, set<string>> nd_table;
map<pair<string, char>, string> d_table;

vector<string> unused_st;
set<string> used_st;

set<char> alphabet;

string make_state(const set<string> &v)
{
	string name = "";
	for (const auto& i : v)
		name += i;
	for (const auto& i : alphabet)
		for (const auto& j : v)
		{
			auto tmp_pair = make_pair(j, i);
			if (nd_table.find(tmp_pair) != nd_table.end())
			{
				auto tmp_vec = nd_table[tmp_pair];
				nd_table[make_pair(name, i)].insert(tmp_vec.begin(), tmp_vec.end());
			}
		}
	return name;
}
inline void print(const map<pair<string, char>, string>& table)
{
	for (const auto&[k, v] : table)
	{
		cout << k.first << "," << k.second << "=" << v << "\n";
	}
}

inline void determ() //2^Q*(V*(log(Q)+3Q)+Q) = 2^Q*(Q*V+Q) = 2^Q*Q*V
{
	//M = (V,Q,q0,F,S)
	size_t alph_size = alphabet.size();
	while (!unused_st.empty()) //2^Q
	{
		string Qcur = unused_st[0];
		size_t states_cnt = 0;
		for (const auto& i : alphabet) //V
		{
			auto tmp_pair = make_pair(Qcur, i);
			if (nd_table.find(tmp_pair) == nd_table.end()) //log(Q)
				continue;
			auto tmp_vec = nd_table[tmp_pair];
			string state = make_state(tmp_vec);
			if (used_st.find(state)==used_st.end()) //log(2^Q) = Q
				unused_st.push_back(state);
			d_table[make_pair(Qcur, i)] = state; //log(2^Q) = Q
			used_st.insert(Qcur); //log(2^Q) = Q
		}
		unused_st.erase(unused_st.begin()); //log(2^Q) = Q
	}

}

inline int parse_automate(const string& file_name )
{
	//M = (V,Q,q0,F,S)

	ifstream file(file_name);
	string str;
	char c;
	string q, f; //q,c=c

	getline(file, str);
	q = str.substr(0, str.find(','));
	unused_st.push_back(q);
	c = str.substr(str.find(',') + 1, str.find_last_of('='))[0];
	alphabet.insert(c);
	f = str.substr(str.find_last_of('=') + 1);
	nd_table[make_pair(q, c)].insert(f);
	//(Q*V)^Q*log(V)*Q=(Q*V)^Q
	while (getline(file, str)) //(Q*V)^Q
	{
		q = str.substr(0, str.find(','));
		c = str.substr(str.find(',') + 1, str.find_last_of('='))[0];
		alphabet.insert(c); //log(V)
		f = str.substr(str.find_last_of('=') + 1);
		nd_table[make_pair(q, c)].insert(f); //log(2^Q) = Q
 	}
	bool is_determ = true;
	for (const auto&[k, v] : nd_table)
		if (v.size() > 2)
		{
			is_determ = false;
			break;
		}

	if (is_determ)
	{
		for (const auto&[k, v] : nd_table)
			d_table[k] = *v.begin();
	}
	else
	{
		determ();
		print(d_table);
	}


	return 0;
}

int parse_str(const string& str)
{
	string Qcur = "q0";
	size_t len = str.size();
	for (size_t i=0; i<len; i++)
	{
		auto tmp_pair = make_pair(Qcur, str[i]);
		if (d_table.find(tmp_pair) == d_table.end())
			return -1;
		Qcur = d_table[tmp_pair];
		if (Qcur.find('f') != -1 && i == (len - 1))
			return 0;
		else if (Qcur.find('f') == -1 && i == (len - 1))
			return -1;
	}
	return -1;
}

inline void parsing_loop()
{
	string str;
	//cin >> str;
	while (cin >> str)
	{
		int ret = parse_str(str);
		cout << (ret < 0 ? "Not a valid string" : "Valid string") << "\n";
		//cin >> str;
	}
}

int main()
{
	int ret;
	parse_automate("test1.txt");
	parsing_loop();
	return 0;
}
