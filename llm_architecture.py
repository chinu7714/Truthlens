import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super(MultiHeadAttention, self).__init__()
        self.num_heads = num_heads
        self.d_model = d_model
        assert d_model % num_heads == 0
        self.depth = d_model // num_heads
        
        self.wq = nn.Linear(d_model, d_model)
        self.wk = nn.Linear(d_model, d_model)
        self.wv = nn.Linear(d_model, d_model)
        self.dense = nn.Linear(d_model, d_model)
        
    def split_heads(self, x, batch_size):
        x = x.view(batch_size, -1, self.num_heads, self.depth)
        return x.permute(0, 2, 1, 3)
        
    def forward(self, q, k, v, mask=None):
        batch_size = q.size(0)
        
        q = self.split_heads(self.wq(q), batch_size)
        k = self.split_heads(self.wk(k), batch_size)
        v = self.split_heads(self.wv(v), batch_size)
        
        scaled_attention_logits = torch.matmul(q, k.transpose(-1, -2)) / math.sqrt(self.depth)
        
        if mask is not None:
            scaled_attention_logits += (mask * -1e9)
            
        attention_weights = F.softmax(scaled_attention_logits, dim=-1)
        output = torch.matmul(attention_weights, v)
        
        output = output.permute(0, 2, 1, 3).contiguous()
        concat_attention = output.view(batch_size, -1, self.d_model)
        return self.dense(concat_attention)

class TransformerBlock(nn.Module):
    def __init__(self, d_model, num_heads, dff, rate=0.1):
        super(TransformerBlock, self).__init__()
        self.mha = MultiHeadAttention(d_model, num_heads)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, dff),
            nn.ReLU(),
            nn.Linear(dff, d_model)
        )
        
        self.layernorm1 = nn.LayerNorm(d_model)
        self.layernorm2 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(rate)
        self.dropout2 = nn.Dropout(rate)
        
    def forward(self, x, training, mask=None):
        attn_output = self.mha(x, x, x, mask)
        attn_output = self.dropout1(attn_output)
        out1 = self.layernorm1(x + attn_output)
        
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output)
        return self.layernorm2(out1 + ffn_output)

class MiniLLM(nn.Module):
    """
    A custom Transformer-based LLM architecture.
    Features: Multi-Head Attention, Positional Encoding, and Feed-Forward Networks.
    """
    def __init__(self, num_layers, d_model, num_heads, dff, input_vocab_size, maximum_position_encoding, rate=0.1):
        super(MiniLLM, self).__init__()
        self.d_model = d_model
        self.num_layers = num_layers
        
        self.embedding = nn.Embedding(input_vocab_size, d_model)
        self.pos_encoding = nn.Parameter(torch.zeros(1, maximum_position_encoding, d_model))
        
        self.enc_layers = nn.ModuleList([TransformerBlock(d_model, num_heads, dff, rate) for _ in range(num_layers)])
        self.dropout = nn.Dropout(rate)
        self.final_layer = nn.Linear(d_model, input_vocab_size)
        
    def forward(self, x, training, mask=None):
        seq_len = x.size(1)
        x = self.embedding(x)
        x *= math.sqrt(self.d_model)
        x += self.pos_encoding[:, :seq_len, :]
        
        x = self.dropout(x)
        
        for i in range(self.num_layers):
            x = self.enc_layers[i](x, training, mask)
            
        return self.final_layer(x)

def build_llm():
    print("Initializing Custom LLM Architecture...")
    model = MiniLLM(
        num_layers=12, 
        d_model=768, 
        num_heads=12, 
        dff=3072, 
        input_vocab_size=50257, 
        maximum_position_encoding=1024
    )
    print("LLM Architecture Built Successfully.")
    return model
